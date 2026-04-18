import { useState } from "react";
import CodeEditor from "./CodeEditor";
import type { TestCase } from "../engine/runCode";

interface StringDPLesson {
  id: string;
  title: string;
  subtitle: string;
  concept: string;
  pattern: string;
  recurrence: string;
  tableExample: {
    rows: string[];
    cols: string[];
    grid: (number | string)[][];
    caption: string;
  };
  insight: string;
  task: string;
  starter: string;
  functionName: string;
  testCases: TestCase[];
  hints: string[];
  solution: string;
  explanation: string;
  commonMistakes: string[];
  interviewWisdom: string;
}

const lessons: StringDPLesson[] = [
  // ─── 1. Longest Common Subsequence ───
  {
    id: "s1",
    title: "Longest Common Subsequence",
    subtitle: "The canonical 2D string DP — every other string DP is a variant of this",
    concept:
      "Given two strings, find the length of the longest subsequence present in both. A subsequence keeps relative order but doesn't need to be contiguous. LCS is the template for diff tools, DNA alignment, and 80% of 2D string DP problems you'll see in interviews.",
    pattern: "2D String DP",
    recurrence: "dp[i][j] = dp[i-1][j-1] + 1  if s1[i-1] == s2[j-1]\n         = max(dp[i-1][j], dp[i][j-1])  otherwise",
    tableExample: {
      rows: ["∅", "a", "b", "c", "d", "e"],
      cols: ["∅", "a", "c", "e"],
      grid: [
        [0, 0, 0, 0],
        [0, 1, 1, 1],
        [0, 1, 1, 1],
        [0, 1, 2, 2],
        [0, 1, 2, 2],
        [0, 1, 2, 3],
      ],
      caption: "LCS(\"abcde\", \"ace\") = 3. dp[i][j] = LCS of first i chars of s1 and first j chars of s2.",
    },
    insight:
      "The 1 in dp[1][1] comes from matching 'a' with 'a'. The 2 in dp[3][2] says LCS(\"abc\", \"ac\") = 2. Key move: when chars match, grab the diagonal + 1. When they don't, inherit the better of left or top.",
    task: "Return the length of the longest common subsequence of text1 and text2.",
    functionName: "longestCommonSubsequence",
    starter: `def longestCommonSubsequence(text1, text2):
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    # Fill dp[i][j] for each 1 <= i <= m, 1 <= j <= n
    # If characters match: dp[i][j] = dp[i-1][j-1] + 1
    # Otherwise: dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    pass`,
    hints: [
      "Use 1-indexed DP: dp[i][j] corresponds to text1[:i] and text2[:j]",
      "When text1[i-1] == text2[j-1], take the diagonal + 1",
      "When they differ, take max(dp[i-1][j], dp[i][j-1])",
      "Return dp[m][n]",
    ],
    solution: `def longestCommonSubsequence(text1, text2):
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i-1] == text2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]`,
    explanation:
      "Build an (m+1) × (n+1) table. Row i represents using first i chars of text1, col j represents first j chars of text2. The base row and column are 0s (empty string has 0 LCS with anything). Fill left-to-right, top-to-bottom. O(m·n) time and space. Can be O(min(m,n)) space with two rows.",
    commonMistakes: [
      "Off-by-one on indexing: dp[i][j] uses text1[i-1], not text1[i]",
      "Confusing subsequence with substring — substring is contiguous (harder)",
      "Forgetting to use max() in the mismatch case — some folks do sum which is wrong",
      "Using O(m·n) space when O(n) is trivial with two rolling rows",
    ],
    interviewWisdom:
      "If you understand LCS, you understand Edit Distance, Shortest Common Supersequence, Longest Palindromic Subsequence, and Distinct Subsequences. Interviewers love asking you to trace the DP table by hand, so practice drawing it. The pattern: match → diagonal+1, mismatch → max of neighbors.",
    testCases: [
      { input: ["abcde", "ace"], expected: 3, label: "abcde/ace = 3" },
      { input: ["abc", "abc"], expected: 3, label: "same = 3" },
      { input: ["abc", "def"], expected: 0, label: "disjoint = 0" },
      { input: ["aaaa", "aa"], expected: 2, label: "dupes = 2" },
    ],
  },

  // ─── 2. Edit Distance ───
  {
    id: "s2",
    title: "Edit Distance",
    subtitle: "Levenshtein distance — insert, delete, replace",
    concept:
      "Minimum operations to transform word1 into word2, using insert, delete, or replace. This one is HARD if you don't see the 3-way choice. Appears in spell checkers, DNA alignment, fuzzy search, and frequently at top-tier interviews.",
    pattern: "2D String DP",
    recurrence:
      "dp[i][j] = dp[i-1][j-1]  if s1[i-1] == s2[j-1]\n         = 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])  otherwise",
    tableExample: {
      rows: ["∅", "h", "o", "r", "s", "e"],
      cols: ["∅", "r", "o", "s"],
      grid: [
        [0, 1, 2, 3],
        [1, 1, 2, 3],
        [2, 2, 1, 2],
        [3, 2, 2, 2],
        [4, 3, 3, 2],
        [5, 4, 4, 3],
      ],
      caption: "Edit distance between \"horse\" and \"ros\" is 3. Table shows min edits for each prefix pair.",
    },
    insight:
      "Three operations = three cells to look at. dp[i-1][j-1] is REPLACE (used regardless of match, but with cost 0 if match). dp[i-1][j] is DELETE from s1. dp[i][j-1] is INSERT into s1. Base cases are critical: empty string to n chars = n insertions.",
    task: "Return the min number of operations (insert/delete/replace) to convert word1 to word2.",
    functionName: "minDistance",
    starter: `def minDistance(word1, word2):
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    # Base row: dp[0][j] = j (j insertions)
    # Base col: dp[i][0] = i (i deletions)
    # Transition: if match → dp[i-1][j-1], else 1 + min(3 neighbors)
    pass`,
    hints: [
      "Initialize dp[0][j] = j and dp[i][0] = i — these are the base cases",
      "If word1[i-1] == word2[j-1]: dp[i][j] = dp[i-1][j-1] (free, no op needed)",
      "Else: dp[i][j] = 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])",
      "Return dp[m][n]",
    ],
    solution: `def minDistance(word1, word2):
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i-1] == word2[j-1]:
                dp[i][j] = dp[i-1][j-1]
            else:
                dp[i][j] = 1 + min(
                    dp[i-1][j-1],  # replace
                    dp[i-1][j],    # delete from word1
                    dp[i][j-1]     # insert into word1
                )
    return dp[m][n]`,
    explanation:
      "Base row: transforming empty string to word2[:j] takes j insertions. Base col: transforming word1[:i] to empty takes i deletions. Then for each cell, either the chars match (free) or we pay 1 for the cheapest of 3 operations. O(m·n) time, O(m·n) space (reducible to O(min(m,n))).",
    commonMistakes: [
      "Forgetting the base row/col — the algorithm is WRONG without them",
      "Adding 1 in the match case — the match is FREE",
      "Taking max instead of min — we want MINIMUM edits",
      "Getting the three operations confused: remember DELETE is dp[i-1][j], INSERT is dp[i][j-1]",
    ],
    interviewWisdom:
      "Edit Distance is often the hardest 2D DP question you'll get. If you can derive the 3-operation recurrence from scratch, you've mastered DP thinking. In a real interview: talk through DELETE vs INSERT while drawing the table — show your work. Bonus: some interviewers ask for the actual edit sequence, which requires backtracking through the dp table.",
    testCases: [
      { input: ["horse", "ros"], expected: 3, label: "horse/ros = 3" },
      { input: ["intention", "execution"], expected: 5, label: "intention/execution = 5" },
      { input: ["", "abc"], expected: 3, label: "empty to abc = 3" },
      { input: ["same", "same"], expected: 0, label: "same = 0" },
    ],
  },

  // ─── 3. Palindromic Substrings ───
  {
    id: "s3",
    title: "Palindromic Substrings",
    subtitle: "Count all palindromic substrings — 2D DP or expand-around-center",
    concept:
      "Given a string, count how many substrings are palindromes. \"aaa\" has 6: three single chars, two \"aa\"s, one \"aaa\". Two approaches: O(n²) DP where dp[i][j] = is s[i..j] a palindrome, or O(n²) expand-around-center which is simpler to code and O(1) space.",
    pattern: "2D Boolean DP / Expand Around Center",
    recurrence:
      "dp[i][j] = True  if i == j (single char)\n         = (s[i] == s[j])  if j - i == 1\n         = (s[i] == s[j] AND dp[i+1][j-1])  otherwise",
    tableExample: {
      rows: ["a", "a", "a"],
      cols: ["a", "a", "a"],
      grid: [
        ["T", "T", "T"],
        ["-", "T", "T"],
        ["-", "-", "T"],
      ],
      caption: "\"aaa\" → 6 palindromic substrings. dp[i][j] = 'T' if s[i..j] is palindrome, '-' if invalid (i > j).",
    },
    insight:
      "The trick: fill the table by LENGTH, not by index order. Length 1 first (all True), then length 2 (check pairs), then length 3+ (use the smaller subproblem). Alternative: for each center (2n-1 centers counting between-char), expand outward while chars match.",
    task: "Return the count of palindromic substrings in s.",
    functionName: "countSubstrings",
    starter: `def countSubstrings(s):
    # Approach: expand around center
    # For each of the 2n-1 centers (n single + n-1 double):
    #   expand outward while s[left] == s[right]
    #   count each valid expansion
    pass`,
    hints: [
      "Use expand-around-center — simpler than 2D DP and O(1) space",
      "There are 2n-1 centers: n single-char centers + n-1 between-char centers",
      "For each center, expand while left >= 0 and right < n and s[left] == s[right]",
      "Count each valid palindrome found during expansion",
    ],
    solution: `def countSubstrings(s):
    count = 0
    n = len(s)
    for center in range(2 * n - 1):
        left = center // 2
        right = left + (center % 2)
        while left >= 0 and right < n and s[left] == s[right]:
            count += 1
            left -= 1
            right += 1
    return count

# Alternative: 2D DP
def countSubstrings_dp(s):
    n = len(s)
    dp = [[False] * n for _ in range(n)]
    count = 0
    for length in range(1, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            if length == 1:
                dp[i][j] = True
            elif length == 2:
                dp[i][j] = (s[i] == s[j])
            else:
                dp[i][j] = (s[i] == s[j] and dp[i+1][j-1])
            if dp[i][j]:
                count += 1
    return count`,
    explanation:
      "Expand-around-center: each palindrome has a center. For odd-length palindromes, center is a char. For even-length, center is between two chars. That's 2n-1 centers. Expand outward as long as chars match. Each successful expansion is a palindromic substring. O(n²) time, O(1) space. The 2D DP version needs O(n²) space but can return dp[i][j] queries in O(1).",
    commonMistakes: [
      "Only counting odd-length palindromes (forgetting between-char centers)",
      "Filling the 2D DP by row-column order — must fill by length",
      "Counting substrings once per palindrome when nested palindromes are multiple",
      "Off-by-one: center = 2n-1, not n",
    ],
    interviewWisdom:
      "Every interviewer expects expand-around-center. It's cleaner, O(1) space, and shows you understand the structure. If asked about Longest Palindromic Substring (instead of count), same approach but track max. Manacher's algorithm is O(n) but almost never required — mention it as a bonus if you know it.",
    testCases: [
      { input: ["aaa"], expected: 6, label: "aaa = 6" },
      { input: ["abc"], expected: 3, label: "abc = 3" },
      { input: ["aaaa"], expected: 10, label: "aaaa = 10" },
      { input: ["abba"], expected: 6, label: "abba = 6" },
    ],
  },

  // ─── 4. Word Break ───
  {
    id: "s4",
    title: "Word Break",
    subtitle: "1D boolean DP with dictionary lookup",
    concept:
      "Given a string and a dictionary, can you segment the string into dictionary words? \"applepenapple\" with [\"apple\",\"pen\"] → True. This pattern comes up constantly: Word Break II, Concatenated Words, Break Palindrome. Master the 1D pattern.",
    pattern: "1D Boolean DP",
    recurrence: "dp[i] = True if any j: dp[j] AND s[j:i] in wordDict",
    tableExample: {
      rows: ["dp[0]", "dp[1]", "dp[2]", "dp[3]", "dp[4]", "dp[5]", "dp[6]", "dp[7]", "dp[8]"],
      cols: ["value"],
      grid: [["T"], ["F"], ["F"], ["F"], ["F"], ["T"], ["F"], ["F"], ["T"]],
      caption: "s = \"leetcode\", dict = [\"leet\",\"code\"]. dp[i] = True if s[:i] is breakable. dp[4]=T (leet), dp[8]=T (leet+code).",
    },
    insight:
      "dp[i] asks: 'is the first i chars breakable?' dp[0] = True (empty string). Then for each i, look back: is there a j where dp[j] is True AND s[j:i] is a word? Think of dp[j] as 'I reached this point legally' and s[j:i] as the final word.",
    task: "Return True if s can be segmented into a space-separated sequence of dictionary words.",
    functionName: "wordBreak",
    starter: `def wordBreak(s, wordDict):
    word_set = set(wordDict)  # O(1) lookup
    n = len(s)
    dp = [False] * (n + 1)
    dp[0] = True
    # For each i from 1 to n:
    #   For each j from 0 to i:
    #     if dp[j] and s[j:i] in word_set: dp[i] = True, break
    pass`,
    hints: [
      "Convert wordDict to a set for O(1) lookups",
      "dp[0] = True (empty string is always breakable)",
      "For each i, check all j < i: if dp[j] and s[j:i] in set, dp[i] = True",
      "Return dp[n]",
    ],
    solution: `def wordBreak(s, wordDict):
    word_set = set(wordDict)
    n = len(s)
    dp = [False] * (n + 1)
    dp[0] = True
    for i in range(1, n + 1):
        for j in range(i):
            if dp[j] and s[j:i] in word_set:
                dp[i] = True
                break
    return dp[n]`,
    explanation:
      "dp[i] means 'first i chars of s can be segmented'. dp[0] is True (empty prefix). For each i, scan all possible final word lengths (from 1 to i). If dp[j] is True (prefix breakable) and s[j:i] is in dict, then dp[i] is True. O(n²) time with set lookup, O(n·max_word_len) if optimized. Breaking out early speeds things up.",
    commonMistakes: [
      "Not converting wordDict to a set — using list gives O(n·k) lookups",
      "Forgetting dp[0] = True — the base case is crucial",
      "Using dp[i-1] only instead of checking all j < i (greedy fails)",
      "Off-by-one: s[j:i] not s[j:i+1]",
    ],
    interviewWisdom:
      "The classic 'can I build this from these pieces' pattern. If follow-up asks for ALL ways to break (Word Break II), combine this with backtracking or memoize the recursion. Tell the interviewer you'll use a set for O(1) dictionary lookup before they ask — shows you're thinking about complexity.",
    testCases: [
      { input: ["leetcode", ["leet", "code"]], expected: true, label: "leetcode = T" },
      { input: ["applepenapple", ["apple", "pen"]], expected: true, label: "applepenapple = T" },
      { input: ["catsandog", ["cats", "dog", "sand", "and", "cat"]], expected: false, label: "catsandog = F" },
      { input: ["a", ["a"]], expected: true, label: "a = T" },
    ],
  },

  // ─── 5. Longest Palindromic Subsequence ───
  {
    id: "s5",
    title: "Longest Palindromic Subsequence",
    subtitle: "LCS in disguise — the elegant trick",
    concept:
      "Find the longest subsequence (not substring) that is a palindrome. \"bbbab\" → \"bbbb\" (length 4). The slick trick: LPS(s) = LCS(s, reverse(s)). But it's also solvable directly with 2D DP that walks the string inward from both ends.",
    pattern: "2D DP (inward)",
    recurrence:
      "dp[i][j] = 1  if i == j\n         = dp[i+1][j-1] + 2  if s[i] == s[j]\n         = max(dp[i+1][j], dp[i][j-1])  otherwise",
    tableExample: {
      rows: ["b", "b", "b", "a", "b"],
      cols: ["b", "b", "b", "a", "b"],
      grid: [
        [1, 2, 3, 3, 4],
        [0, 1, 2, 2, 3],
        [0, 0, 1, 1, 3],
        [0, 0, 0, 1, 1],
        [0, 0, 0, 0, 1],
      ],
      caption: "\"bbbab\" → LPS = 4 (\"bbbb\"). dp[i][j] = LPS of s[i..j]. Answer is dp[0][n-1].",
    },
    insight:
      "Fill the table for single chars first (diagonal = 1), then length 2, then longer. When s[i] == s[j], we can extend the inner palindrome by 2. Otherwise, drop one side. This is the OPPOSITE direction of LCS: we go inward from (0, n-1), not outward from (0, 0).",
    task: "Return the length of the longest palindromic subsequence of s.",
    functionName: "longestPalindromeSubseq",
    starter: `def longestPalindromeSubseq(s):
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    # Fill diagonal: dp[i][i] = 1
    # Fill by length (2, 3, ..., n)
    # If s[i] == s[j]: dp[i][j] = dp[i+1][j-1] + 2
    # Else: dp[i][j] = max(dp[i+1][j], dp[i][j-1])
    pass`,
    hints: [
      "Initialize dp[i][i] = 1 for all i",
      "Fill by increasing substring length (length = 2, 3, ..., n)",
      "For length 2: dp[i][j] = 2 if chars match, else 1",
      "For length 3+: if s[i]==s[j]: dp[i+1][j-1] + 2, else: max of shrinking one side",
    ],
    solution: `def longestPalindromeSubseq(s):
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    for i in range(n):
        dp[i][i] = 1
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            if s[i] == s[j]:
                dp[i][j] = (dp[i+1][j-1] if length > 2 else 0) + 2
            else:
                dp[i][j] = max(dp[i+1][j], dp[i][j-1])
    return dp[0][n-1]

# Alternative: LPS(s) = LCS(s, reversed(s))
def longestPalindromeSubseq_lcs(s):
    t = s[::-1]
    n = len(s)
    dp = [[0] * (n+1) for _ in range(n+1)]
    for i in range(1, n+1):
        for j in range(1, n+1):
            if s[i-1] == t[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[n][n]`,
    explanation:
      "dp[i][j] = length of longest palindromic subsequence in s[i..j]. Base: single char is palindrome of length 1. Transition: if endpoints match, extend the inner LPS by 2. If not, drop one end and take the max. Critical: fill by LENGTH (diagonals), not row-col order, because dp[i][j] depends on dp[i+1][j-1]. The LCS trick — LPS(s) = LCS(s, rev(s)) — works because any palindromic subseq of s is a common subseq of s and its reverse.",
    commonMistakes: [
      "Filling in row-col order instead of by length — dependencies aren't ready",
      "Using > 2 length check incorrectly — when length == 2 and chars match, inner is empty (treat as 0)",
      "Not initializing the diagonal (all 1s)",
      "Confusing with Longest Palindromic Substring (which is a different, harder problem)",
    ],
    interviewWisdom:
      "Drop the LCS-with-reversed trick as a follow-up or alternative. Interviewers respect candidates who see the same problem from multiple angles. If asked for the palindrome itself, reconstruct by walking the dp table backwards. Pattern: inward 2D DP → fill diagonals by length.",
    testCases: [
      { input: ["bbbab"], expected: 4, label: "bbbab = 4" },
      { input: ["cbbd"], expected: 2, label: "cbbd = 2" },
      { input: ["aaaa"], expected: 4, label: "aaaa = 4" },
      { input: ["abcde"], expected: 1, label: "abcde = 1" },
    ],
  },

  // ─── 6. Distinct Subsequences ───
  {
    id: "s6",
    title: "Distinct Subsequences",
    subtitle: "Count, not check — the 'how many ways' 2D DP",
    concept:
      "Given s and t, count the number of distinct subsequences of s that equal t. \"rabbbit\" has 3 ways to form \"rabbit\" (pick different 'b's). This is a COUNTING DP, not yes/no — you sum up ways instead of taking min/max/bool.",
    pattern: "2D Counting DP",
    recurrence:
      "dp[i][j] = dp[i-1][j]  if s[i-1] != t[j-1]\n         = dp[i-1][j-1] + dp[i-1][j]  if match",
    tableExample: {
      rows: ["∅", "r", "a", "b", "b", "b", "i", "t"],
      cols: ["∅", "r", "a", "b", "b", "i", "t"],
      grid: [
        [1, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 0, 0],
        [1, 1, 1, 2, 1, 0, 0],
        [1, 1, 1, 3, 3, 0, 0],
        [1, 1, 1, 3, 3, 3, 0],
        [1, 1, 1, 3, 3, 3, 3],
      ],
      caption: "\"rabbbit\" → \"rabbit\" = 3 ways. Base column = 1 (empty target is matched once). Base row past ∅ = 0.",
    },
    insight:
      "When characters match, you have TWO choices: use this char (dp[i-1][j-1]) or skip it (dp[i-1][j]). SUM them — that's the count. When they don't match, you MUST skip this s char (dp[i-1][j]). Base: dp[i][0] = 1 because empty target is always matched (by picking nothing).",
    task: "Return the count of distinct subsequences of s that equal t.",
    functionName: "numDistinct",
    starter: `def numDistinct(s, t):
    m, n = len(s), len(t)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    # Base: dp[i][0] = 1 for all i (empty target matched once)
    # Transition:
    #   If s[i-1] == t[j-1]: dp[i][j] = dp[i-1][j-1] + dp[i-1][j]
    #   Else: dp[i][j] = dp[i-1][j]
    pass`,
    hints: [
      "dp[i][0] = 1 for all i (empty target always matches — pick nothing)",
      "dp[0][j] = 0 for j > 0 (can't match non-empty target with empty source)",
      "When chars match: sum both use-this-char and skip-this-char options",
      "When chars don't match: must skip this char — inherit dp[i-1][j]",
    ],
    solution: `def numDistinct(s, t):
    m, n = len(s), len(t)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = 1  # Empty target is matched by picking nothing
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s[i-1] == t[j-1]:
                dp[i][j] = dp[i-1][j-1] + dp[i-1][j]
            else:
                dp[i][j] = dp[i-1][j]
    return dp[m][n]`,
    explanation:
      "dp[i][j] = number of ways s[:i] can form t[:j]. Base column: 1 (empty target is matched once — the empty subsequence). When s[i-1] matches t[j-1], you can either 'use' this char (dp[i-1][j-1] ways) or 'skip' it (dp[i-1][j] ways). Sum them. When chars don't match, you have no choice — skip. O(m·n) time and space.",
    commonMistakes: [
      "Forgetting the base column — dp[i][0] = 1, not 0",
      "Taking max instead of sum — this is a COUNTING problem",
      "Using dp[i-1][j-1] alone when chars match (missing the 'skip' option)",
      "Off-by-one confusion with the ∅ prefix",
    ],
    interviewWisdom:
      "The use/skip recurrence is a power move. Any time you have 'how many ways' in a subsequence/subset problem, think: 'use this element or don't'. Sum both. This shows up in Distinct Subsequences, 0/1 Knapsack count variant, Partition Equal Subset Sum count. Master it.",
    testCases: [
      { input: ["rabbbit", "rabbit"], expected: 3, label: "rabbbit/rabbit = 3" },
      { input: ["babgbag", "bag"], expected: 5, label: "babgbag/bag = 5" },
      { input: ["abc", "abc"], expected: 1, label: "abc/abc = 1" },
      { input: ["abc", "d"], expected: 0, label: "abc/d = 0" },
    ],
  },
];

interface Props {
  onBack: () => void;
  /** Called the first time the user passes each lesson's tests. Lesson ID is passed so callers can dedupe. */
  onLessonComplete?: (lessonId: string) => void;
}

export default function StringDPTrainer({ onBack, onLessonComplete }: Props) {
  const [idx, setIdx] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [solved, setSolved] = useState(false);
  const [hintIdx, setHintIdx] = useState(0);
  // Track which lessons have been awarded so we only fire XP once per lesson.
  const [awarded, setAwarded] = useState<Set<string>>(new Set());

  const lesson = lessons[idx];
  const total = lessons.length;

  function handleNext() {
    if (idx < total - 1) {
      setIdx((i) => i + 1);
      setShowSolution(false);
      setSolved(false);
      setHintIdx(0);
    }
  }
  function handlePrev() {
    if (idx > 0) {
      setIdx((i) => i - 1);
      setShowSolution(false);
      setSolved(false);
      setHintIdx(0);
    }
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1 -mx-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Home
      </button>

      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-2xl">📝</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">String DP Masterclass</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">6 hands-on lessons on the string DP patterns interviewers ask most</p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">Lesson {idx + 1} of {total}</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-400 font-semibold">{lesson.pattern}</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 mb-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-pink-500 to-orange-500 rounded-full transition-all duration-500" style={{ width: `${((idx + 1) / total) * 100}%` }} />
      </div>

      <div className="space-y-5" key={lesson.id}>
        {/* Title + Concept */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{lesson.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 italic">{lesson.subtitle}</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{lesson.concept}</p>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Recurrence</p>
            <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{lesson.recurrence}</pre>
          </div>
        </div>

        {/* Table visualization */}
        <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5">
          <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-3">📊 DP Table Walkthrough</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 italic">{lesson.tableExample.caption}</p>
          <div className="overflow-x-auto">
            <table className="border-collapse text-xs font-mono">
              <thead>
                <tr>
                  <th className="w-10 h-10"></th>
                  {lesson.tableExample.cols.map((c, i) => (
                    <th key={i} className="w-10 h-10 text-slate-600 dark:text-slate-400 font-bold">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lesson.tableExample.grid.map((row, ri) => (
                  <tr key={ri}>
                    <th className="w-10 h-10 text-slate-600 dark:text-slate-400 font-bold">{lesson.tableExample.rows[ri]}</th>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className={`w-10 h-10 border border-blue-200 dark:border-blue-800 text-center ${
                          cell === "-" || cell === 0
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                            : "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 font-bold"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-4 leading-relaxed">{lesson.insight}</p>
        </div>

        {/* Task */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">✍️ Your Turn</p>
          <p className="text-sm text-slate-700 dark:text-slate-300">{lesson.task}</p>
        </div>

        {/* Hints */}
        {hintIdx > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2 animate-fade-in">
            {lesson.hints.slice(0, hintIdx).map((h, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <span className="bg-amber-100 text-amber-700 w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                <span>{h}</span>
              </div>
            ))}
          </div>
        )}

        {/* Solution */}
        {showSolution && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl overflow-hidden animate-fade-in">
            <div className="bg-emerald-100 dark:bg-emerald-900/40 border-b border-emerald-200 dark:border-emerald-800 px-4 py-2">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">✅ Solution</p>
            </div>
            <div className="p-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 italic mb-2">{lesson.explanation}</p>
              <div className="bg-[#1e1e2e] rounded-lg p-3">
                <pre className="text-xs text-emerald-300 font-mono whitespace-pre-wrap">{lesson.solution}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Code editor */}
        <CodeEditor
          functionName={lesson.functionName}
          testCases={lesson.testCases}
          starterJS=""
          starterPython={lesson.starter}
          onPass={() => {
            setSolved(true);
            if (!awarded.has(lesson.id)) {
              setAwarded((prev) => new Set(prev).add(lesson.id));
              onLessonComplete?.(lesson.id);
            }
          }}
        />

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 text-xs">
          {!solved && (
            <>
              <button onClick={() => setHintIdx((h) => Math.min(h + 1, lesson.hints.length))} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                {hintIdx === 0 ? "Get a hint" : hintIdx < lesson.hints.length ? `Next hint (${hintIdx + 1}/${lesson.hints.length})` : "All hints shown"}
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button onClick={() => setShowSolution(!showSolution)} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                {showSolution ? "Hide solution" : "Show solution"}
              </button>
            </>
          )}
        </div>

        {/* Common Mistakes */}
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-5">
          <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-2">⚠️ Common Mistakes</p>
          <ul className="space-y-1">
            {lesson.commonMistakes.map((m) => (
              <li key={m} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Interview Wisdom */}
        <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-2xl p-5">
          <p className="text-xs font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wider mb-2">💎 Interview Wisdom</p>
          <p className="text-sm text-slate-700 dark:text-slate-300">{lesson.interviewWisdom}</p>
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between pt-4">
          <button onClick={handlePrev} disabled={idx === 0} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            ← Previous
          </button>
          <button onClick={handleNext} disabled={idx === total - 1} className="group px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-800 dark:hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            Next lesson
            <svg className="w-4 h-4 inline ml-1.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
