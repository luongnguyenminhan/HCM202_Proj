"use client";

import React from "react";

export type CardProps = {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  bodyClassName?: string;
  titleClassName?: string;
  footerClassName?: string;
};

function Card({ title, extra, footer, children, height, className, style, bodyClassName, titleClassName, footerClassName }: CardProps) {
  return (
    <div className={`card ${className ?? ""}`} style={{ ...(height ? { height } : {}), ...style }}>
      {(title || extra) && (
        <div className={`card-title ${titleClassName ?? ""}`}>
          <div>{title}</div>
          <div>{extra}</div>
        </div>
      )}
      <div className={`card-body ${bodyClassName ?? ""}`}>{children}</div>
      {footer && <div className={`card-title ${footerClassName ?? ""}`}>{footer}</div>}
    </div>
  );
}

export default Card;