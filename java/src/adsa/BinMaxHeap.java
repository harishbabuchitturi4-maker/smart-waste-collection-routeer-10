package adsa;

import model.Bin;
import java.util.ArrayList;
import java.util.List;

/**
 * ==============================================================================
 * PROJECT: Smart Waste Collection Router (Team 10)
 * SUBJECT: ADSA (Unit 2 - Priority Queue & Binary Max-Heap)
 * ==============================================================================
 * 
 * BinMaxHeap implements a custom Binary Max-Heap array-based data structure.
 * Why Max-Heap?
 * - In municipal waste collection, bins with the highest urgency (fullest + fastest
 *   accumulating) MUST be collected first.
 * - Max-Heap provides:
 *     * O(1) peek at highest priority bin.
 *     * O(log N) insertion of new bin readings.
 *     * O(log N) extraction of highest priority bin for routing.
 * 
 * Array Index Formula:
 * - Parent(i)      = (i - 1) / 2
 * - LeftChild(i)   = 2 * i + 1
 * - RightChild(i)  = 2 * i + 2
 */
public class BinMaxHeap {
    private final List<Bin> heap;

    public BinMaxHeap() {
        this.heap = new ArrayList<>();
    }

    public int size() {
        return heap.size();
    }

    public boolean isEmpty() {
        return heap.isEmpty();
    }

    /**
     * Inserts a bin into the Max-Heap.
     * Time Complexity: O(log N)
     */
    public void insert(Bin bin) {
        heap.add(bin);
        heapifyUp(heap.size() - 1);
    }

    /**
     * Inspects the highest priority bin without removing it.
     * Time Complexity: O(1)
     */
    public Bin peekMax() {
        if (isEmpty()) return null;
        return heap.get(0);
    }

    /**
     * Extracts and returns the bin with highest priority score.
     * Time Complexity: O(log N)
     */
    public Bin extractMax() {
        if (isEmpty()) return null;
        
        Bin maxBin = heap.get(0);
        Bin lastBin = heap.remove(heap.size() - 1);
        
        if (!isEmpty()) {
            heap.set(0, lastBin);
            heapifyDown(0);
        }
        
        return maxBin;
    }

    /**
     * Maintains Max-Heap property from bottom up (used after insertion).
     */
    private void heapifyUp(int index) {
        while (index > 0) {
            int parentIndex = (index - 1) / 2;
            Bin current = heap.get(index);
            Bin parent = heap.get(parentIndex);

            // If current bin has strictly higher priority than parent, swap them
            if (current.getPriorityScore() > parent.getPriorityScore()) {
                swap(index, parentIndex);
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    /**
     * Maintains Max-Heap property from top down (used after extractMax).
     */
    private void heapifyDown(int index) {
        int size = heap.size();
        while (index < size) {
            int leftChild = 2 * index + 1;
            int rightChild = 2 * index + 2;
            int largest = index;

            if (leftChild < size && 
                heap.get(leftChild).getPriorityScore() > heap.get(largest).getPriorityScore()) {
                largest = leftChild;
            }

            if (rightChild < size && 
                heap.get(rightChild).getPriorityScore() > heap.get(largest).getPriorityScore()) {
                largest = rightChild;
            }

            if (largest != index) {
                swap(index, largest);
                index = largest;
            } else {
                break;
            }
        }
    }

    private void swap(int i, int j) {
        Bin temp = heap.get(i);
        heap.set(i, heap.get(j));
        heap.set(j, temp);
    }

    /**
     * Rebuilds the entire heap from a given list of bins.
     * Time Complexity: O(N) using bottom-up heap construction.
     */
    public void buildHeap(List<Bin> bins) {
        heap.clear();
        heap.addAll(bins);
        for (int i = (heap.size() / 2) - 1; i >= 0; i--) {
            heapifyDown(i);
        }
    }

    /**
     * Returns a snapshot copy of the current heap elements.
     */
    public List<Bin> getElements() {
        return new ArrayList<>(heap);
    }

    /**
     * Visual representation of heap tree levels (for student understanding).
     */
    public void printHeapTree() {
        System.out.println("\n--- [ADSA] Current Bin Max-Heap Status (Highest Priority at Root) ---");
        for (int i = 0; i < heap.size(); i++) {
            Bin b = heap.get(i);
            int parentIdx = (i == 0) ? -1 : (i - 1) / 2;
            String parentStr = (parentIdx == -1) ? "ROOT" : heap.get(parentIdx).getId();
            System.out.printf("  [Index %2d] %s (Priority: %5.1f) <-- Parent: %s\n", 
                i, b.getId(), b.getPriorityScore(), parentStr);
        }
    }
}
