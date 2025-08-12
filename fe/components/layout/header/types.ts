export type HeaderProps = {
    /** Open the chat dock (used by "Chatbot" menu) */
    onOpenChat?: () => void;
    /** When true, non-chat items scroll to in-page sections instead of routing */
    inPage?: boolean;
  };
  
  export type NavItem = {
    key: "home" | "chat" | "docs" | "analysis";
    label: string;
    /** Target section id for in-page scroll, e.g. #docs */
    target: string;
  };
  