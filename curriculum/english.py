"""Reviewed English teaching copy. Stable IDs make missing translations a build error."""
import copy
import re

# id | statement | explanation
_ROWS = '''
pair_sum_sorted|Return the zero-based indices of two numbers adding up to target in a sorted array, or [] if no pair exists.|If the sum is too small, increase the left value; if it is too large, decrease the right value.
triplet_sum|Return all distinct triples whose sum is zero.|Fix one number, then solve the remaining pair with two pointers while skipping duplicates.
is_palindrome_valid|Check whether a string is a palindrome, ignoring case and non-alphanumeric characters.|Skip punctuation from both ends and compare the remaining characters.
largest_container|Find the greatest area of water held between two vertical lines.|The shorter line limits the height, so moving that side is the only way to improve the area.
shift_zeros|Move all zeros to the end, preserving the relative order of nonzero values.|The write position marks the next slot for a nonzero value.
next_sequence|Produce the next lexicographic permutation; wrap the last permutation back to the first.|Increase the rightmost ascent as little as possible, then reverse the decreasing suffix.
pair_sum_unsorted|Return the zero-based indices of a pair adding up to target in an unsorted array.|Look for the complement among earlier values before storing the current value.
verify_sudoku|Check that no digit repeats in any row, column or 3×3 box of a Sudoku board.|Maintain three independent sets of constraints; a dot denotes an empty cell.
zero_striping|For every zero in the original matrix, set its entire row and column to zero.|Record original zero rows and columns before modifying any cells.
longest_chain|Find the length of the longest run of consecutive integers, regardless of input order.|Start a run only at a number whose predecessor is absent.
geometric_triplets|Count index triples i < j < k with ratio r between adjacent values; r > 0.|For each middle value, multiply matching frequencies on its left and right.
linked_reversal|Reverse a singly linked list.|Save the next link, point the current node backward, then advance prev and current.
remove_kth|Remove the kth node from the end, where 1 ≤ k ≤ list length.|Keep two pointers k positions apart; a dummy head handles removal of the first node.
linked_intersection|Find the shared node of two lists with a common tail; return its value, or null if none exists.|Switch each pointer to the other head at the end to equalize total travel distance. Compare node identity.
lru_cache|Perform put/get operations on a capacity-limited LRU cache; a missing key returns -1.|A map locates nodes and a doubly linked list moves recently used entries to the end in O(1).
palindromic_list|Check whether a linked list is a palindrome, then restore its original links.|Find the middle, reverse the second half and compare corresponding values before restoring it.
flatten_list|Flatten a multilevel list depth first: a child chain follows its parent immediately.|A stack holds the postponed next node while the child chain is processed.
linked_loop|Detect a cycle; pos is the zero-based tail target, or -1 for no cycle.|Inside a cycle, the fast pointer eventually catches the slow pointer.
linked_midpoint|Return the middle node's value; choose the second middle for an even-length list.|When the fast pointer reaches the end, the slow pointer has traveled halfway.
happy_number|Repeatedly replace a positive integer with the sum of its squared digits. Does it reach 1?|Repeated states form a cycle; Floyd's algorithm detects it without storing every state.
substring_anagrams|Return starting indices of all substrings that are anagrams of pattern.|A fixed-length sliding window compares character frequencies.
unique_substring|Find the length of the longest substring with no repeated characters.|Move the left boundary beyond the previous occurrence without ever moving it backward.
uniform_substring|Find the longest substring that can become a single repeated character after at most k replacements.|Within a window, replace every character except the most frequent one.
insertion_index|Find the first position in a sorted array whose value is at least target; return len(a) if none exists.|The half-open candidate interval [left, right) maintains the lower-bound insertion position.
first_last|Return the first and last indices of target, or [-1, -1] if it is absent.|Two boundary searches find the first value ≥ target and the first value > target.
cutting_wood|Find the highest saw setting that yields at least k units of wood.|Collected wood decreases monotonically as the cut rises; round the midpoint upward to ensure progress.
rotated_search|Find target's index in a rotated strictly increasing array, or -1.|One half is always sorted; check whether target lies inside that half's bounds.
median_arrays|Find the median of two sorted arrays whose combined length is positive.|Partition the shorter array so every value on the left is no greater than every value on the right.
matrix_search|Rows are sorted and each row starts above the previous row's last value. Determine whether target exists.|Treat the rectangular matrix as one sorted flat array.
local_maxima|Find a peak index; adjacent values differ and values beyond the array are −∞.|A peak must exist in the direction of an upward slope.
weighted_selection|Given positive weights and a ticket from 1 through their sum, return the ticket's bucket index.|Use lower_bound on cumulative weights. A fixed ticket makes the weighted-choice example reproducible.
valid_parentheses|Check matching and nesting order for (), [] and {}.|A closing bracket must match the most recently opened bracket.
next_largest|For each element, return the nearest strictly greater value to its right, or -1.|A monotonic stack holds indices whose next greater value has not been found.
evaluate_expression|Evaluate an integer expression containing +, −, parentheses and spaces.|Save the outer sum and sign at an opening parenthesis, then restore that context at closing.
remove_duplicates|Repeatedly remove adjacent equal-character pairs until no such pair remains.|Only the stack's top can pair with the incoming character.
queue_stacks|Perform enqueue/dequeue operations; dequeue on an empty queue returns null.|Moving the input stack into the output stack reverses the order exactly once per transfer.
window_maximum|Return the maximum of each window of length k, where 1 ≤ k ≤ n.|A deque holds live indices with decreasing values.
frequent_strings|Return the k most frequent strings, breaking frequency ties lexicographically.|Prioritize pairs of negative frequency and word in a heap.
combine_lists|Merge k sorted lists into a single sorted list.|Keep only the current head of each nonempty stream in the heap.
stream_median|Return the median after each number is added.|A left max-heap and right min-heap differ in size by at most one.
sort_k_sorted|Sort an array where every element is at most k positions from its sorted position.|The next minimum lies among the next k + 1 candidates.
merge_intervals|Merge overlapping closed intervals; touching endpoints count as overlap.|After sorting, compare each start with the end of the last merged interval.
interval_overlaps|Intersect two sorted lists of internally disjoint closed intervals.|After each comparison, advance the interval that ends earlier.
largest_overlap|Find the maximum number of simultaneously active half-open intervals [start, end).|Sort events with endings before beginnings at an equal coordinate.
range_sum|Return inclusive sums for zero-based [left, right] range queries.|Subtract prefix[left] from prefix[right + 1].
k_sum_subarrays|Count contiguous subarrays summing to k, including those with negative values.|Every earlier prefix equal to current − k defines a matching subarray.
product_except|For each position, return the product of every other element without division.|Combine the product strictly to the left with the product strictly to the right.
invert_tree|Swap the left and right subtrees of every node.|Apply the same local swap recursively at every node.
balanced_tree|Check that the child subtree heights differ by at most one at every node.|Return heights bottom up; -1 propagates an imbalance.
rightmost_nodes|Return the rightmost visible node at each depth.|Breadth-first traversal lets you take the last node at each level.
widest_level|Find the greatest level width between its outermost nodes, including gaps.|Complete-tree indices preserve missing positions between nodes.
validate_bst|Validate the strict binary search tree property; duplicates are disallowed.|Pass open lower and upper bounds inherited from all ancestors.
lowest_ancestor|Return the LCA value for two existing unique values p and q.|If the targets occur in different child subtrees, the current node is their common ancestor.
build_tree|Reconstruct a tree with unique values from preorder and inorder traversals.|Preorder supplies the root; its inorder position separates the subtrees.
maximum_tree_path|Find the greatest sum of a nonempty path that may pass through any node.|Return one branch upward; a global candidate may join two branches through the node.
tree_symmetry|Check whether a tree is mirror-symmetric around its root.|Compare outer and inner children in mirrored pairs.
tree_columns|Group nodes into vertical columns from left to right, using top-down BFS order within each column.|A left child decreases its column number; a right child increases it.
kth_bst|Return the kth smallest BST value, where 1 ≤ k ≤ n.|Inorder traversal visits a BST in increasing order.
serialize_tree|Encode a tree in preorder with # for null, then reconstruct it; return the encoding and restored tree.|Null-child markers make the representation unambiguous.
design_trie|Insert words, perform exact searches and test prefixes.|Edges represent characters; the end flag distinguishes a complete word from a prefix.
wildcard_words|Match dictionary words against patterns where a dot replaces exactly one character.|A normal character selects one edge; a dot explores all child edges.
board_words|Find dictionary words on a board using four-directional moves without reusing a cell in one word.|A trie prunes paths that are not prefixes of any dictionary word.
graph_copy|Clone the component reachable from vertex 0 in an adjacency list and return its structure.|An old-to-new node map preserves shared references and terminates cycles.
count_islands|Count four-directionally connected components of cells containing 1.|Each unvisited land cell starts exactly one island traversal.
matrix_infection|Cells contain 0 for empty, 1 for healthy and 2 for infected. Return the time to infect all healthy cells, or -1.|Multi-source BFS processes one minute per queue layer.
bipartite|Can every edge connect vertices of opposite colors using only two colors?|Every neighbor must receive the opposite color, including in disconnected components.
increasing_path|Find the longest strictly increasing four-directional path in a matrix.|Strict increase prevents cycles; memoization stores the best path starting at each cell.
word_transform|Change one letter at a time through dictionary words; return the number of words in the shortest chain, or 0.|BFS explores every chain of one length before moving to the next length.
merge_communities|Perform merge(a, b) and size(a) operations on disjoint communities.|DSU joins roots, compresses paths and stores component sizes at roots.
prerequisites|Can all n courses be completed when each edge is [course, prerequisite]?|Kahn's algorithm removes zero-indegree vertices; leftover vertices reveal a cycle.
shortest_path|Return distances from start in a directed graph with nonnegative weights; use null for unreachable vertices.|Dijkstra extracts the smallest current distance and relaxes outgoing edges.
connect_dots|Connect every point with minimum total Manhattan edge length.|Prim's algorithm adds the cheapest edge from the connected component to an unvisited point.
permutations|Enumerate permutations of distinct numbers.|Choose an unused element, recurse, then undo the choice.
subsets|Enumerate all subsets of distinct numbers.|For each position, explore excluding and including its element.
n_queens|Return every placement of n nonattacking queens as zero-based column indices, one per row.|Track occupied columns and both diagonals, restoring every constraint after each branch.
combinations_sum|Return combinations of positive distinct candidates summing to target; candidates may be reused.|Keep indices nondecreasing to avoid reordered duplicates, and prune once a sorted candidate exceeds the remainder.
phone_combinations|Return all letter combinations for digits 2–9 using a telephone keypad.|Choose one letter per digit, recurse to the next digit and undo the choice.
climbing_stairs|Count ways to climb n steps using moves of one or two steps.|The final move comes from n − 1 or n − 2; the empty climb has one way.
minimum_coins|Find the fewest coins needed for amount, with unlimited positive denominations; return -1 if impossible.|For each amount, try every possible final coin and reuse the best smaller answer.
matrix_pathways|Count paths from the top-left to bottom-right cell of an m×n grid, moving only right or down.|Each cell receives paths from above and from the left.
burglary|Find the maximum sum of nonadjacent house values.|Compare skipping the current house with taking it after the best answer two houses back.
lcs|Find the length of the longest common subsequence of two strings.|Match equal characters diagonally; otherwise skip one character from either string.
longest_palindrome|Return the longest palindromic substring; choose the earliest start on ties.|A substring is palindromic when its ends match and its interior is palindromic.
maximum_subarray|Find the maximum sum of a nonempty contiguous subarray.|At each element, either extend the previous subarray or start a new one.
knapsack|Maximize total value under a weight limit; each item may be selected once.|Compare skipping an item with taking it from the previous DP row.
largest_square|Return the area of the largest all-ones square.|Its side length is one plus the minimum of the three neighboring square side lengths.
jump_end|Each value is the maximum jump length. Can you reach the last index?|Maintain the farthest reachable index; a gap beyond it cannot be crossed.
gas_stations|Return a starting station that permits a full circuit, or -1.|If the running tank becomes negative, no start within that failed segment can succeed.
candies|Give everyone at least one candy, and more than each lower-rated neighbor. Minimize the total.|Two passes independently enforce the left and right neighbor constraints.
sort_linked|Sort a linked list in O(n log n) time.|Split at the middle and merge the sorted halves.
sort_array|Sort an array in ascending order.|Merge two sorted halves by repeatedly choosing the smaller current element.
kth_largest|Find the kth largest array value, counting duplicates.|Quickselect retains only the partition containing zero-based rank n − k.
dutch_flag|Sort an array containing only 0, 1 and 2 in one pass.|The regions before low and after high are final; recheck the value swapped in from high.
hamming_weights|Return the number of set bits for every integer from 0 through n.|The answer for i reuses i >> 1 and adds the least significant bit.
lonely_integer|Every number occurs twice except one. Return the unpaired number.|Equal numbers cancel under XOR, independent of processing order.
swap_bits|Swap neighboring bits of a nonnegative 32-bit integer.|Separate even and odd bit positions with masks, shift them in opposite directions and combine.
spiral_traversal|Read a rectangular matrix clockwise, beginning at the top-left corner.|Shrink four boundaries after traversing each corresponding side.
reverse_integer|Reverse the decimal digits of a signed 32-bit integer; return 0 on overflow.|Extract the least significant digit and append it to the result, then restore the sign.
collinear_points|Find the maximum number of distinct points on a single straight line.|For each anchor, count normalized integer direction pairs (dy, dx) with a consistent sign.
josephus|People numbered 1…n stand in a circle; every kth person is removed. Return the survivor's number.|Map the smaller circle's survivor back with a cyclic offset after each elimination.
triangle_numbers|A triangle starts with 1; each cell is the sum of its three upper neighbors, treating absent neighbors as 0. Find the first even value's 1-based position in row n ≥ 3.|Only the first four positions' parity is needed; their pattern repeats every four rows.
'''
LESSON_TEXT = {parts[0]: parts[1:] for row in _ROWS.strip().splitlines() if (parts := row.split('|'))}

from .patterns import G, X
GUIDES = {
1: G('Two pointers replace a search over all pairs with a shrinking candidate region. A move is useful only when you can prove that the discarded pairs cannot answer the question.',
['The input is sorted, or sorting is allowed.', 'You compare two ends, find pairs or compact values in place.'],
['Define what each pointer represents.', 'Write the condition that permits discarding one side.', 'Evaluate the current pair, then move a pointer that makes progress.', 'Handle equal values and empty or single-element inputs.'],
X('a=[1,2,4,6,8], target=10', ['Start at values 1 and 8: sum 9 is too small.', 'Discard the left value 1; even its largest partner was too small.', 'Values 2 and 8 sum to 10.', 'Return zero-based indices [1,4].'], '[1,4]'),
'For unsorted pair sums, a hash map avoids sorting. For contiguous ranges, consider a sliding window instead.',
['Moving a pointer without a monotonic argument may skip answers.', 'The same index cannot be both elements of a pair.', 'Sorting changes the original indices.']),
2: G('A hash map makes earlier observations available without scanning them again. Decide whether each key represents existence, a count or a stored index.',
['You need complements, counts, membership or grouping.', 'An earlier prefix or value can complete the current candidate.'],
['Define the key and the meaning of its value.', 'Determine whether to query before or after inserting.', 'Update the map once the current observation becomes available.', 'Test duplicates, missing keys and zero counts.'],
X('a=[3,2,4], target=6', ['For 3, complement 3 is absent; store index 0.', 'For 2, complement 4 is absent; store index 1.', 'For 4, complement 2 is stored at index 1.', 'Return [1,2] without reusing the current position.'], '[1,2]'),
'A sorted scan can use less extra memory. Hash-table operations are expected O(1), not a universal worst-case guarantee.',
['Membership is different from a positive frequency.', 'Inserting first can pair an item with itself.', 'Repeated values can represent distinct positions.']),
3: G('Linked-list algorithms change connections rather than move array slots. Preserve access to the unprocessed suffix before overwriting a link.',
['The input consists of nodes connected by next/prev links.', 'You must reverse, merge, remove or reorder nodes in place.'],
['Draw a three-node example and identify all changed edges.', 'Save the next node before redirecting a link.', 'Use a dummy head when the first node may change.', 'Advance pointers and verify the resulting chain terminates.'],
X('Reverse 1→2→3', ['Save node 2, redirect 1.next to null.', 'Save node 3, redirect 2.next to node 1.', 'Save null, redirect 3.next to node 2.', 'The new head is node 3.'], '3→2→1'),
'Arrays offer indexed access; linked lists offer cheap changes once a node is found. An LRU cache combines a map with a doubly linked list.',
['Equal values do not imply identical nodes.', 'Overwriting next too early loses the rest of the list.', 'Check empty lists, head removal and accidental cycles.']),
4: G('Pointers moving at different speeds reveal a midpoint or a repeating state. Inside a finite cycle, their relative position eventually repeats and they meet.',
['You need a midpoint without measuring the list first.', 'A deterministic process may enter a cycle.'],
['Define one transition through the sequence.', 'Advance slow once and fast twice, checking links first.', 'Compare identities for nodes and values for numeric states.', 'Specify which middle node is returned for even lengths.'],
X('A list 1→2→3→4', ['Both pointers start at node 1.', 'Slow moves to 2 and fast to 3.', 'Slow moves to 3 and fast reaches null.', 'The second middle is node 3.'], '3'),
'A visited set is easier to adapt when you also need every visited state, but consumes memory.',
['Check fast.next before taking the second step.', 'Initialization changes the choice of even-length middle.', 'A repeated value alone does not prove a linked cycle.']),
5: G('A sliding window maintains exactly the information for a contiguous range. Adding the right element and removing the left element must update the same state consistently.',
['The answer is a substring or contiguous subarray.', 'A range condition can be updated as boundaries move.'],
['Choose a fixed window or a condition for shrinking it.', 'Add the next right-hand element.', 'Remove left-hand contributions until the condition is restored.', 'Update the answer at the point where the window is valid.'],
X('Longest unique substring of "abba"', ['Read a and b: the window "ab" has length 2.', 'The next b repeats; move left past the previous b.', 'The window is now "b".', 'Read a to obtain "ba"; the maximum remains 2.'], '2'),
'Variable windows need a valid shrinking argument. With arbitrary negative sums, prefix frequencies may work where a sum-based window does not.',
['Never move the left boundary backward.', 'Remove outgoing values from the tracked counts.', 'Substring and subsequence are different problems.']),
6: G('Binary search repeatedly discards a region using a monotonic condition. The key decision is the meaning of the bounds, not the midpoint formula alone.',
['The data is sorted or a yes/no predicate changes only once.', 'You need a boundary, insertion point or optimal feasible threshold.'],
['Define the candidate interval and whether its ends are included.', 'Evaluate the midpoint and preserve every possible answer.', 'Make each iteration strictly reduce the interval.', 'Interpret the final boundary, including len(a).'],
X('a=[1,3,5,6], target=2', ['Begin with [left,right)=[0,4).', 'mid=2 gives 5; retain [0,2).', 'mid=1 gives 3; retain [0,1).', 'mid=0 gives 1; advance left to 1 and return it.'], '1'),
'Linear search handles unstructured data. Searching a feasible answer uses a predicate instead of direct equality.',
['Do not mix closed and half-open updates.', 'Duplicates require first/last-boundary logic.', 'Rounding the midpoint must agree with progress when assigning left=mid.']),
7: G('A stack records unfinished work in last-in, first-out order. Its top is the only pending item that may be completed next.',
['There is nested structure, undoing or delayed resolution.', 'You seek the next greater value with a monotonic stack.'],
['Define what one stack entry means.', 'Complete or remove top entries while the new input resolves them.', 'Push work that remains unfinished.', 'Check what an empty or nonempty final stack means.'],
X('Validate "([])"', ['Push (.', 'Push [.', 'The ] matches and removes the top [.', 'The ) removes (; the empty final stack confirms validity.'], 'True'),
'A queue processes oldest work first. A monotonic deque can remove obsolete candidates at both ends.',
['Check emptiness before popping.', 'A closing bracket must match the most recent opening.', 'Store indices when expiry or distance matters.']),
8: G('A heap exposes the current extreme without sorting everything. Keep just the candidates needed to choose the next best value.',
['You need repeated minima/maxima or top-k candidates.', 'Several sorted streams must be merged, or values arrive incrementally.'],
['Define the priority and a stable tie-breaker.', 'Initialize the current candidates.', 'Pop the best candidate and add its replacement.', 'Maintain size and partition invariants if two heaps are used.'],
X('Running medians for [2,1,5]', ['Insert 2: median 2.', 'Insert 1 and balance the two halves.', 'The middle values are 1 and 2: median 1.5.', 'Insert 5; the lower half has the extra element: median 2.'], '[2,1.5,2]'),
'For a single static ordering, sorting may be simpler. Python heapq is a min-heap; negating numeric priorities emulates a max-heap.',
['A heap array is not fully sorted.', 'Rebalance both sizes and ordering for running medians.', 'Equal priorities may require an explicit comparable tie-breaker.']),
9: G('Sorting interval endpoints turns overlapping ranges into a sweep. Endpoint conventions determine whether touching intervals count as simultaneous.',
['You merge ranges, intersect schedules or count active events.', 'A sorted scan can summarize all earlier overlapping intervals.'],
['State whether intervals are closed or half-open.', 'Sort intervals or start/end events.', 'Maintain the last merged end or current active count.', 'Handle equal endpoints using the chosen convention.'],
X('Merge closed intervals [[1,3],[3,5],[8,9]]', ['Take [1,3] as the current interval.', 'The next start 3 touches the closed end 3, so merge to [1,5].', 'Start 8 is beyond 5; finish the first range.', 'Append [8,9].'], '[[1,5],[8,9]]'),
'Closed merging can join touching ranges. For half-open occupancy, process an ending before a beginning at the same coordinate.',
['Do not apply closed-end rules to half-open occupancy.', 'Sort before using a last-interval summary.', 'Advance the earlier ending interval when intersecting two lists.']),
10: G('Prefix aggregates turn a range query into the difference of two boundaries. A leading empty prefix gives ranges starting at zero the same formula as every other range.',
['You answer repeated static range queries.', 'A subarray condition can be expressed as a difference of prefixes.'],
['Define prefix[i] as the aggregate strictly before i.', 'Add the empty prefix at index 0.', 'Translate inclusive [left,right] into boundary indices left and right+1.', 'For counting, query earlier prefix frequencies before storing the current one.'],
X('a=[2,-1,3,5], query [1,3]', ['Start prefix=[0].', 'Accumulate [0,2,1,4,9].', 'The inclusive query uses prefix[4]−prefix[1].', 'Compute 9−2=7.'], '7'),
'Prefix sums suit static data. Frequent updates may call for a Fenwick or segment tree. Products need different handling around zero.',
['The right boundary is offset by one for inclusive queries.', 'Negative values invalidate some sliding-window arguments.', 'Seed prefix frequency zero once for subarrays starting at index 0.']),
11: G('Tree recursion solves a subtree and returns a precisely defined result to its parent. The value returned upward may differ from the best complete answer found locally.',
['The input is a hierarchy with left/right children.', 'A subtree answer can be composed from child answers.'],
['Define the return value for an empty subtree.', 'Compute the required child answers.', 'Combine them while enforcing inherited constraints.', 'Keep global candidates separate from the single result returned upward.'],
X('Validate BST [5,1,7,null,null,4,8]', ['Root 5 gives its right subtree the lower bound 5.', 'Node 7 is valid inside (5,+∞).', 'Its left child 4 must be inside (5,7).', '4 violates the inherited bound, even though it is below its parent 7.'], 'False'),
'BFS naturally processes levels. An explicit stack avoids Python recursion limits for very deep trees.',
['Checking only immediate children is insufficient for BST validity.', 'A maximum path can join two branches locally but returns only one upward.', 'Tree width may include missing positions.']),
12: G('A trie stores a shared prefix once. Following a path proves a prefix exists; a separate end marker proves that a complete word ends there.',
['Many words share beginnings.', 'Queries concern prefixes, wildcards or pruning a board search.'],
['Create missing character transitions during insertion.', 'Mark only the final node as a complete word.', 'Require that marker for exact lookup.', 'For wildcard/board searches, explore allowed edges and restore per-path state.'],
X('Insert "apple"; search("app") and prefix("app")', ['Create the path a→p→p→l→e.', 'Mark only e as the word end.', 'The app path exists but does not end a word.', 'Exact lookup is False; prefix lookup is True.'], '[False,True]'),
'A set is simpler for exact whole-word membership. Tries trade node/edge memory for access to prefixes.',
['Not every existing prefix is a word.', 'A dot replaces exactly one character.', 'Do not reuse a board cell within one word path.']),
13: G('A graph models relationships. Define edge direction and weights first: BFS, DFS, Dijkstra, DSU and topological sorting solve different questions.',
['Objects have links, dependencies or neighboring cells.', 'You need reachability, connectivity, propagation or a path.'],
['Identify vertices, edge direction, weights and disconnected components.', 'Choose the algorithm from the required result.', 'Mark visits at a deliberate point to avoid duplicate work.', 'Track predecessors for paths, or initialize all sources for simultaneous spread.'],
X('Unweighted edges 0–1, 0–2, 1–3, 2–3; path 0→3', ['Start BFS with queue [0] at distance 0.', 'Discover 1 and 2 at distance 1; mark them when enqueued.', 'From 1, discover 3 at distance 2.', 'The alternative via 2 is equally long; no second enqueue is needed.'], '2 edges: 0→1→3'),
'BFS minimizes edge count, not arbitrary weighted cost. Dijkstra requires nonnegative weights; DSU answers connectivity rather than shortest paths.',
['Visit disconnected components when the question covers the whole graph.', 'Directed and undirected cycle checks differ.', 'One BFS layer represents one time step for simultaneous spreading.']),
14: G('Backtracking explores a decision tree by choosing, recursing and undoing. Every sibling branch must start with the same parent state.',
['You must enumerate permutations, combinations or placements.', 'A partial choice can be rejected before it becomes complete.'],
['Define the partial solution, remaining choices and completion condition.', 'Try each permitted next choice.', 'Update all constraints and recurse.', 'Undo every change and copy finished paths.'],
X('Subsets of [1,2], excluding first', ['Exclude both values and save [].', 'Include only 2 and save [2], then undo it.', 'Include only 1 and save [1].', 'Include both and save [1,2], then restore the empty path.'], '[[],[2],[1],[1,2]]'),
'If states repeat and only an optimum or count is required, memoization/DP may avoid enumeration. Prune only with a justified impossibility condition.',
['Saving the mutable path itself corrupts earlier answers.', 'Undo constraint sets as well as the path.', 'Decide how duplicate input values affect result uniqueness.']),
15: G('Dynamic programming reuses answers to overlapping subproblems. A precise state definition explains which smaller answers are sufficient and in what order to compute them.',
['Subproblems repeat and their answers can be reused.', 'You need a best cost, count or existence result.'],
['Describe dp[state] in one sentence.', 'Set base cases, including empty input or amount zero.', 'Derive transitions from the last choice and order computations accordingly.', 'Optimize memory only after preserving every required dependency.'],
X('coins=[1,3,4], amount=6; dp[x] is the fewest coins', ['dp[0]=0; unreachable amounts start above any possible answer.', 'Amounts 3 and 4 each need one coin.', 'At 6, compare 1+dp[5], 1+dp[3] and 1+dp[2].', 'The best uses 3+3, giving two coins.'], '2'),
'Greedy would choose 4+1+1 here, using three coins. Backtracking is appropriate when every explicit combination is needed.',
['0/1 items and unlimited coins have different update dependencies.', 'Iteration order must agree with the recurrence.', 'A nonempty maximum subarray can have a negative answer.']),
16: G('A greedy algorithm commits to a local choice without backtracking. Its correctness depends on proving that an optimal continuation still exists after that choice.',
['You can prove discarded candidates can never help again.', 'An exchange argument or reachability invariant justifies a local choice.'],
['State the local selection rule.', 'Prove why an alternative can safely be discarded or exchanged.', 'Maintain the sufficient summary, such as farthest reach or fuel balance.', 'Test cases where an attractive early choice blocks a better continuation.'],
X('Jump lengths [2,3,1,1,4]', ['Initially index 0 is reachable.', 'From 0, farthest becomes 2.', 'Index 1 is reachable and extends farthest to 4.', 'The last index is covered; no explicit jump sequence is needed.'], 'True'),
'If the safe-choice proof fails, consider DP. Largest-first coin selection is wrong for general denominations.',
['Passing examples is not a correctness proof.', 'Never extend reach from an unreachable index.', 'A circular gas route also needs a nonnegative total balance.']),
17: G('Ordering creates structure for later comparisons and merges. Full sorting is unnecessary when only a rank or partition is required.',
['Processing benefits from ordered neighbors or sorted streams.', 'You need a kth element, merging or partitioning into groups.'],
['Decide whether you need full order, a rank or just groups.', 'Choose based on worst-case time, memory and stability.', 'State the partition or merge invariant.', 'Check duplicates, already sorted input and mutation of the source.'],
X('Merge sort [4,1,3,2]', ['Split into [4,1] and [3,2], then singletons.', 'Merge the small pairs into [1,4] and [2,3].', 'Take 1, then 2, then 3 from the current heads.', 'Append the remaining 4.'], '[1,2,3,4]'),
'Quickselect is expected linear but can be quadratic. Heaps suit streams and top-k; stability matters for equal-key records.',
['Partitioning does not sort either partition.', 'In-place changes may affect later consumers.', 'Duplicates and pivot choices affect quickselect progress.']),
18: G('Bit operations manipulate number positions directly. XOR cancels equal pairs and masks select positions, but only when the input assumptions support those properties.',
['You need flags, compact sets or population counts.', 'Equal values occur in pairs, or a fixed bit width is specified.'],
['Write a small example in binary.', 'Choose AND for masking, OR for setting and XOR for toggling/cancellation.', 'Define the width and shift behavior.', 'Check zero, high bits and repetition assumptions.'],
X('Find the singleton in [4,1,2,1,2]', ['Start result=0.', 'After 4 and 1, the XOR is 5.', 'XOR 2 gives 7, then XOR 1 gives 6.', 'XOR the final 2 to obtain 4; both pairs cancel.'], '4'),
'XOR does not replace a frequency table for arbitrary repetitions. Python integers have unbounded precision; explicitly mask when simulating 32 bits.',
['Negative Python integers need explicit width rules.', 'Parenthesize shifts and arithmetic deliberately.', 'A zero mask or value can be a valid answer.']),
19: G('Mathematical problems often become simpler after choosing an invariant: an integer direction pair, a smaller renumbered circle or four moving boundaries. There is no single algorithm for every problem in this chapter.',
['Coordinates, periodicity, symmetry or cyclic numbering appear.', 'Direct simulation is too expensive or floating-point values can be avoided.'],
['Work a small example and choose a representation.', 'State the geometric or arithmetic invariant.', 'Normalize signs, indices and directions; handle boundaries separately.', 'Prove the recurrence or pattern and compare with small direct simulations.'],
X('Points (0,0), (1,1), (2,2), (2,0)', ['Anchor at (0,0).', 'The direction to (1,1) is (dy,dx)=(1,1).', 'Normalize (2,2) by gcd(2,2) to get (1,1); (2,0) gives (0,1).', 'Two other points share the first direction; including the anchor gives three.'], '3'),
'A few matching examples do not establish a formula. Connecting geometric points at minimum total cost still requires a graph algorithm.',
['Compare normalized integer directions instead of floating-point slopes.', 'Separate zero-based Josephus recurrence from its one-based output.', 'Coincident points need separate handling before dividing by gcd(0,0).']),
}

_COST_WORDS = {'в среднем':'expected', 'худшее':'worst case', 'ответа':'output', 'ответ':'output', 'без':'excluding', 'бита':'bits', 'амортизированно':'amortized', 'на операцию':'per operation', 'на преобразование':'per transformation', 'подготовка':'preprocessing', 'выбор':'selection', 'в худшем случае':'worst case', 'словарь':'dictionary', 'сумма длин':'total lengths'}

def localize_catalog(chapters, lessons):
    if {l['id'] for l in lessons} != set(LESSON_TEXT) or {c['id'] for c in chapters} != set(GUIDES):
        raise ValueError('English curriculum coverage does not match the catalog')
    translated_lessons = copy.deepcopy(lessons)
    for lesson in translated_lessons:
        lesson['ru'] = lesson['title']
        lesson['statement'], lesson['idea'] = LESSON_TEXT[lesson['id']]
        for key in ('time', 'space'):
            for ru, en in _COST_WORDS.items():
                lesson[key] = lesson[key].replace(ru, en)
            if re.search('[А-Яа-яЁё]', lesson[key]):
                raise ValueError(f"Untranslated complexity: {lesson['id']}")
    translated_chapters = copy.deepcopy(chapters)
    for chapter in translated_chapters:
        guide = copy.deepcopy(GUIDES[chapter['id']])
        chapter.update(ru=chapter['title'], use=guide['signals'][0], invariant=INVARIANTS[chapter['id']-1], pitfall=guide['pitfalls'][0], guide=guide)
    for chapter in translated_chapters:
        if re.search('[А-Яа-яЁё]', str(chapter)):
            raise ValueError('Untranslated English chapter')
    for lesson in translated_lessons:
        for key in ('ru', 'statement', 'idea', 'time', 'space'):
            if not lesson[key] or re.search('[А-Яа-яЁё]', lesson[key]):
                raise ValueError(f"Missing English text: {lesson['id']}/{key}")
    return translated_chapters, translated_lessons

INVARIANTS = [
'Each pointer move excludes candidates that cannot solve the problem.',
'The map describes only the already processed portion of the input.',
'The next unprocessed node remains reachable before a link is overwritten.',
'The fast pointer takes two transitions for each slow-pointer transition.',
'The tracked state describes exactly the current window [left, right].',
'The correct boundary remains in the candidate search interval.',
'The top is the most recent unfinished entry.',
'The root contains the highest-priority remaining candidate.',
'After sorting, only the last active merged interval must be compared.',
'Prefix i contains the contribution strictly before position i.',
'Each call returns a precisely defined answer for its subtree.',
'The root-to-node path defines a prefix; a separate marker identifies a word end.',
'Visited state prevents processing the same vertex repeatedly.',
'After undoing a choice, state equals its value before that choice.',
'Every dependency is available before computing the current DP state.',
'Each committed choice preserves a provable global property.',
'Processed regions already satisfy their ordering or partition condition.',
'Each bit position follows the chosen operation and width conventions.',
'Transformations preserve the geometric or arithmetic meaning of the representation.',
]
