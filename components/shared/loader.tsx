// components/TreeComponent.jsx
import React from "react";

const Loader = () => {
  return (
    <div className="flex w-full items-center justify-center">
      <div className="tree">
        {Array.from({ length: 4 }).map((_, x) => (
          <div key={x} className="branch" style={{ "--x": x }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} style={{ "--i": i }}></span>
            ))}
          </div>
        ))}
        <div className="stem">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} style={{ "--i": i }}></span>
          ))}
        </div>
        <span className="shadow"></span>
      </div>
    </div>
  );
};

export default Loader;
