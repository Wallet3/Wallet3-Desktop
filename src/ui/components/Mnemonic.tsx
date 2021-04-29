import './Mnemonic.css';

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import React from 'react';

export default ({ phrases }: { phrases: string[] }) => {
  const rows = phrases.length / 4;
  const rowWords: string[][] = phrases.length === 0 ? new Array(3).fill(new Array(4).fill('')) : [];

  for (let i = 0; i < rows; i++) {
    const row: string[] = [];

    for (let j = 0; j < 4; j++) {
      row[j] = phrases[i * 4 + j];
    }

    rowWords.push(row);
  }

  const tableRows = rowWords.map((row, ri) => {
    return (
      <tr key={ri}>
        {row.map((word, wi) => {
          return (
            <td key={`row-${ri}-${wi}`}>
              {word ? (
                <div>
                  <span>{word}</span>
                  <span className="no">{ri * 4 + wi + 1}</span>
                </div>
              ) : (
                <Skeleton width={64} height={20} style={{ margin: '8px 0' }} />
              )}
            </td>
          );
        })}
      </tr>
    );
  });

  return (
    <SkeletonTheme color="#6186ff20" highlightColor="#6186ff90">
      <table className="mnemonic">
        <tbody>{tableRows}</tbody>
      </table>
    </SkeletonTheme>
  );
};
