import React from "react";

export const H1: React.FC<React.PropsWithChildren> = ({ children }) => (
  <h1 className="typo-h1">{children}</h1>
);

export const H2: React.FC<React.PropsWithChildren> = ({ children }) => (
  <h2 className="typo-h2">{children}</h2>
);

export const H3: React.FC<React.PropsWithChildren> = ({ children }) => (
  <h3 className="typo-h3">{children}</h3>
);

export const P: React.FC<React.PropsWithChildren<{ muted?: boolean }>> = ({ children, muted }) => (
  <p className={`typo-body ${muted ? "typo-muted" : ""}`}>{children}</p>
);

export default { H1, H2, H3, P };