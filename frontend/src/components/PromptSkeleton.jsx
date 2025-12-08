import React, { useEffect, useState } from "react";
 
export default function PromptSkeleton({
  data = [],
  CardComponent,
  cardProps = {},
  batchSize = 12,
}) {
  const [visible, setVisible] = useState([]);
 
  useEffect(() => {
    if (!data || data.length === 0) {
      setVisible([]);
      return;
    }
 
    const timer = setTimeout(() => {
      setVisible(data.slice(0, batchSize));
    }, 50);
 
    return () => clearTimeout(timer);
  }, [data, batchSize]);
 
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
      {visible.map((p) => (
        <CardComponent key={p.id} prompt={p} {...cardProps} />
      ))}
    </div>
  );
}
 