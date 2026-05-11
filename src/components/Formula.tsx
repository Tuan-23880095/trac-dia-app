"use client";

import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface FormulaProps {
  tex: string;      // Chuỗi ký hiệu LaTeX
  block?: boolean;  // Nếu true sẽ hiển thị ở giữa dòng, khổ lớn
}

const Formula: React.FC<FormulaProps> = ({ tex, block = false }) => {
  return (
    <span className={block ? "block my-4 overflow-x-auto" : "inline-block"}>
      {block ? (
        <BlockMath math={tex} />
      ) : (
        <InlineMath math={tex} />
      )}
    </span>
  );
};

export default Formula;
