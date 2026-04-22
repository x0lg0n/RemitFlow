import axios from "axios";
import {
	getInFlightSep31Transactions,
	InFlightSep31Transaction,
	updateSep31TransactionState,
} from "./transaction.service";

type LocalStatus = "pending" | "processing" | "completed" | "failed";

interface ExternalTransactionSnapshot {
	externalStatus: string;
	stellarTxHash: string | null;
	raw: Record<string, unknown>;
}

let syncInProgress = false;

function mapExternalToLocalStatus(externalStatus: string): LocalStatus {
	const normalized = externalStatus.toLowerCase();

	if (["completed", "success", "settled"].includes(normalized)) {
		return "completed";
	}

	if (["failed", "error", "expired", "refunded", "rejected", "cancelled"].includes(normalized)) {
		return "failed";
	}

	if (["pending", "pending_sender", "pending_receiver", "pending_customer_info_update"].includes(normalized)) {
		return "pending";
	}

	return "processing";
}

function parseExternalTransaction(payload: Record<string, unknown>): ExternalTransactionSnapshot | null {
	const transaction =
		typeof payload.transaction === "object" && payload.transaction !== null
			? (payload.transaction as Record<string, unknown>)
			: payload;

	const statusCandidate =
		typeof transaction.status === "string"
			? transaction.status
			: typeof payload.status === "string"
				? payload.status
				: null;

	if (!statusCandidate) {
		return null;
	}

	const stellarTxHash =
		typeof transaction.stellar_transaction_id === "string"
			? transaction.stellar_transaction_id
			: typeof transaction.stellar_tx_hash === "string"
				? transaction.stellar_tx_hash
				: null;

	return {
		externalStatus: statusCandidate,
		stellarTxHash,
		raw: payload,
	};
}

async function fetchExternalStatus(
	transaction: InFlightSep31Transaction
): Promise<ExternalTransactionSnapshot | null> {
	if (!transaction.externalTxId) {
		return null;
	}

	const { data } = await axios.get<Record<string, unknown>>(
		`${transaction.anchorBaseUrl}/transactions/${transaction.externalTxId}`,
		{
			headers: { Authorization: `Bearer ${transaction.anchorAuthToken}` },
			timeout: 8000,
		}
	);

	return parseExternalTransaction(data);
}

async function emitJsonRpcStatusChange(payload: {
	localTransactionId: string;
	externalTransactionId: string | null;
	previousStatus: string;
	nextStatus: string;
	raw: Record<string, unknown>;
}): Promise<void> {
	const jsonRpcUrl = process.env.SEP31_JSONRPC_URL;
	if (!jsonRpcUrl) {
		return;
	}

	const method = process.env.SEP31_JSONRPC_METHOD ?? "notify_transaction_status_changed";

	await axios.post(
		jsonRpcUrl,
		{
			jsonrpc: "2.0",
			id: `${payload.localTransactionId}:${Date.now()}`,
			method,
			params: {
				transaction_id: payload.externalTransactionId,
				local_transaction_id: payload.localTransactionId,
				previous_status: payload.previousStatus,
				status: payload.nextStatus,
				timestamp: new Date().toISOString(),
				payload: payload.raw,
			},
		},
		{ timeout: 5000 }
	);
}

async function syncOneTransaction(transaction: InFlightSep31Transaction): Promise<void> {
	try {
		const snapshot = await fetchExternalStatus(transaction);
		if (!snapshot) {
			return;
		}

		const mappedStatus = mapExternalToLocalStatus(snapshot.externalStatus);
		const shouldUpdate =
			transaction.externalStatus !== snapshot.externalStatus || transaction.status !== mappedStatus;

		if (!shouldUpdate) {
			return;
		}

		await updateSep31TransactionState({
			id: transaction.id,
			status: mappedStatus,
			externalStatus: snapshot.externalStatus,
			externalPayload: snapshot.raw,
			stellarTxHash: snapshot.stellarTxHash,
		});

		await emitJsonRpcStatusChange({
			localTransactionId: transaction.id,
			externalTransactionId: transaction.externalTxId,
			previousStatus: transaction.externalStatus ?? transaction.status,
			nextStatus: snapshot.externalStatus,
			raw: snapshot.raw,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.warn(`[SEP31_SYNC] Failed to sync transaction ${transaction.id}: ${message}`);
	}
}

export async function runSep31LifecycleSyncBatch(): Promise<void> {
	if (syncInProgress) {
		return;
	}

	syncInProgress = true;
	try {
		const limit = Number.parseInt(process.env.SEP31_SYNC_BATCH_SIZE ?? "100", 10);
		const transactions = await getInFlightSep31Transactions(Number.isNaN(limit) ? 100 : limit);

		for (const transaction of transactions) {
			await syncOneTransaction(transaction);
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`[SEP31_SYNC] Batch sync failed: ${message}`);
	} finally {
		syncInProgress = false;
	}
}

export function startSep31LifecycleSyncWorker(): NodeJS.Timeout {
	const interval = Number.parseInt(process.env.SEP31_SYNC_INTERVAL_MS ?? "30000", 10);
	const intervalMs = Number.isNaN(interval) ? 30000 : Math.max(interval, 5000);

	const timer = setInterval(() => {
		void runSep31LifecycleSyncBatch();
	}, intervalMs);

	void runSep31LifecycleSyncBatch();

	return timer;
}
