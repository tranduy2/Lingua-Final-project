"use client";

import diff_match_patch from "diff-match-patch";

interface AnswerDiffProps {
  userAnswer: string;
  correctAnswer: string;
}

/**
 * Visual diff component that highlights differences between user's answer
 * and the correct answer using diff-match-patch library.
 * - Red strikethrough = wrong parts in user's answer
 * - Green highlight = correct parts the user missed
 */
export function AnswerDiff({ userAnswer, correctAnswer }: AnswerDiffProps) {
  const dmp = new diff_match_patch();
  const diffs = dmp.diff_main(userAnswer.toLowerCase(), correctAnswer.toLowerCase());
  dmp.diff_cleanupSemantic(diffs);

  return (
    <div className="space-y-3">
      {/* User's answer with wrong parts highlighted */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Your answer:</p>
        <p className="text-sm font-mono p-3 bg-muted/50 rounded-lg leading-relaxed">
          {diffs.map((part, i) => {
            const [op, text] = part;
            if (op === 0) {
              return <span key={i}>{text}</span>;
            } else if (op === -1) {
              return (
                <span
                  key={i}
                  className="bg-red-200 dark:bg-red-800/40 text-red-700 dark:text-red-300 line-through px-0.5 rounded"
                >
                  {text}
                </span>
              );
            }
            return null;
          })}
        </p>
      </div>

      {/* Correct answer with missing parts highlighted */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Correct answer:</p>
        <p className="text-sm font-mono p-3 bg-muted/50 rounded-lg leading-relaxed">
          {diffs.map((part, i) => {
            const [op, text] = part;
            if (op === 0) {
              return <span key={i}>{text}</span>;
            } else if (op === 1) {
              return (
                <span
                  key={i}
                  className="bg-green-200 dark:bg-green-800/40 text-green-700 dark:text-green-300 px-0.5 rounded font-semibold"
                >
                  {text}
                </span>
              );
            }
            return null;
          })}
        </p>
      </div>
    </div>
  );
}
