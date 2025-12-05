/**
 * Gerenciador de filas por grupo
 * Garante que mensagens do mesmo grupo sejam processadas sequencialmente,
 * mas permite processamento paralelo entre grupos diferentes
 */

type QueueTask = () => Promise<void>;

/**
 * Cria uma fila para processar tarefas sequencialmente
 */
function createGroupQueue() {
  const queue: QueueTask[] = [];
  let processing = false;

  /**
   * Processa a fila sequencialmente
   */
  async function processQueue(): Promise<void> {
    if (processing) {
      return;
    }

    processing = true;

    while (queue.length > 0) {
      const task = queue.shift();
      if (task) {
        try {
          await task();
        } catch (error) {
          console.error("❌ Erro ao processar tarefa da fila:", error);
        }
      }
    }

    processing = false;
  }

  /**
   * Adiciona uma tarefa à fila e processa se não estiver processando
   */
  async function enqueue(task: QueueTask): Promise<void> {
    return new Promise((resolve, reject) => {
      queue.push(async () => {
        try {
          await task();
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      processQueue();
    });
  }

  return { enqueue };
}

/**
 * Cria um gerenciador de filas por grupo
 */
export function createQueueManager() {
  // Map que armazena as filas de cada grupo
  const queues = new Map<bigint, ReturnType<typeof createGroupQueue>>();

  /**
   * Obtém ou cria a fila para um grupo específico
   */
  function getQueue(groupId: bigint) {
    if (!queues.has(groupId)) {
      queues.set(groupId, createGroupQueue());
    }
    return queues.get(groupId)!;
  }

  /**
   * Adiciona uma tarefa à fila do grupo especificado
   * @param groupId ID do grupo
   * @param task Função assíncrona a ser executada
   */
  async function enqueue(groupId: bigint, task: QueueTask): Promise<void> {
    const queue = getQueue(groupId);
    await queue.enqueue(task);
  }

  /**
   * Normaliza o ID do grupo para garantir consistência
   */
  function normalizeGroupId(chatId: bigint, groupWebhookMap: Map<bigint, string>): bigint | null {
    // Tenta encontrar o ID normalizado no mapa
    for (const [groupId] of groupWebhookMap.entries()) {
      const targetId = groupId < 0n ? groupId : -groupId;
      if (
        chatId === targetId ||
        chatId === -targetId ||
        chatId === groupId
      ) {
        return groupId;
      }
    }
    return null;
  }

  return {
    enqueue,
    normalizeGroupId,
  };
}

// Tipo para facilitar o uso
export type QueueManager = ReturnType<typeof createQueueManager>;

