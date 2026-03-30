export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          wallet_address: string;
          created_at: string;
          display_name: string | null;
          custom_url_slug: string | null;
          branding_color: string | null;
          branding_logo_url: string | null;
        };
        Insert: {
          wallet_address: string;
          created_at?: string;
          display_name?: string | null;
          custom_url_slug?: string | null;
          branding_color?: string | null;
          branding_logo_url?: string | null;
        };
        Update: {
          wallet_address?: string;
          created_at?: string;
          display_name?: string | null;
          custom_url_slug?: string | null;
          branding_color?: string | null;
          branding_logo_url?: string | null;
        };
      };
      payment_links: {
        Row: {
          id: string;
          creator_wallet_address: string;
          recipient_wallet_address: string;
          amount: string;
          memo: string | null;
          short_url: string;
          qr_code_url: string | null;
          created_at: string;
          expires_at: string | null;
          status: 'active' | 'expired' | 'completed';
          custom_branding_enabled: boolean;
        };
        Insert: {
          id?: string;
          creator_wallet_address: string;
          recipient_wallet_address: string;
          amount: string;
          memo?: string | null;
          short_url: string;
          qr_code_url?: string | null;
          created_at?: string;
          expires_at?: string | null;
          status?: 'active' | 'expired' | 'completed';
          custom_branding_enabled?: boolean;
        };
        Update: {
          id?: string;
          creator_wallet_address?: string;
          recipient_wallet_address?: string;
          amount?: string;
          memo?: string | null;
          short_url?: string;
          qr_code_url?: string | null;
          created_at?: string;
          expires_at?: string | null;
          status?: 'active' | 'expired' | 'completed';
          custom_branding_enabled?: boolean;
        };
      };
      transactions: {
        Row: {
          id: string;
          payment_link_id: string;
          sender_wallet_address: string;
          tx_hash: string;
          amount: string;
          status: 'pending' | 'completed' | 'failed';
          created_at: string;
          confirmed_at: string | null;
        };
        Insert: {
          id?: string;
          payment_link_id: string;
          sender_wallet_address: string;
          tx_hash: string;
          amount: string;
          status?: 'pending' | 'completed' | 'failed';
          created_at?: string;
          confirmed_at?: string | null;
        };
        Update: {
          id?: string;
          payment_link_id?: string;
          sender_wallet_address?: string;
          tx_hash?: string;
          amount?: string;
          status?: 'pending' | 'completed' | 'failed';
          created_at?: string;
          confirmed_at?: string | null;
        };
      };
    };
  };
};
