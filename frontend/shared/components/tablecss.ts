export const tableCss = {
  "&": {
    bg: "#0b0b0f",
    borderRadius: "xl",
    border: "1px solid",
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },

  "& thead": {
    bg: "#111118",
  },

  "& tbody": {
    bg: "#0b0b0f",
  },

  "& th": {
    color: "#a1a1aa",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    fontSize: "xs",
    textTransform: "uppercase",
    letterSpacing: "wider",
    bg: "#111118",
  },

  "& td": {
    color: "#e4e4e7",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    bg: "#0b0b0f",
  },

  "& tr:hover td": {
    bg: "#15151c",
  },

  "& tr:last-child td": {
    borderBottom: "none",
  },
};
