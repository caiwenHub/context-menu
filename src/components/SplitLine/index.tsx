import React from "react";

const SplitLine: React.FC<{
  margin?: string;
}> = ({ margin }) => {
  return <div className="splitline-line" style={{ margin }}></div>;
};

export default SplitLine;
