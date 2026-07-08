function Badge({ children, type = "default", value }) {
  const className = getBadgeClassName(type, value);

  return <span className={className}>{children}</span>;
}

function getBadgeClassName(type, value) {
  if (type === "isWorking") {
    if (value === "O") return "badge working-o";
    if (value === "X") return "badge working-x";
    return "badge";
  }

  return "badge";
}

export default Badge;
