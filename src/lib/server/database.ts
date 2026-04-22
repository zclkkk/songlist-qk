export type Database = {
  public: {
    Tables: {
      songs: {
        Row: {
          id: string;
          title: string;
          artist: string;
          language: string;
          status: string;
          tags: string[];
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          artist: string;
          language: string;
          status: string;
          tags?: string[];
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          artist?: string;
          language?: string;
          status?: string;
          tags?: string[];
          is_public?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      requests: {
        Row: {
          id: string;
          song_title: string;
          artist: string;
          language: string;
          message: string;
          requester_name: string | null;
          status: string;
          matched_song_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          song_title: string;
          artist?: string;
          language: string;
          message: string;
          requester_name?: string | null;
          status?: string;
          matched_song_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          song_title?: string;
          artist?: string;
          language?: string;
          message?: string;
          requester_name?: string | null;
          status?: string;
          matched_song_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: '';
            columns: ['matched_song_id'];
            isOneToOne: false;
            referencedRelation: 'songs';
            referencedColumns: ['id'];
          }
        ];
      };
      settings: {
        Row: {
          key: string;
          value: string;
        };
        Insert: {
          key: string;
          value: string;
        };
        Update: {
          key?: string;
          value?: string;
        };
        Relationships: [];
      };
      request_rate_limits: {
        Row: {
          client_key: string;
          request_count: number;
          reset_at: string;
        };
        Insert: {
          client_key: string;
          request_count: number;
          reset_at: string;
        };
        Update: {
          client_key?: string;
          request_count?: number;
          reset_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      accept_song_request: {
        Args: { request_id: string };
        Returns: string;
      };
      consume_request_rate_limit: {
        Args: {
          p_client_key: string;
          p_max_requests: number;
          p_window_seconds: number;
        };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
