export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      kana_catalog: {
        Row: {
          alphabet: string;
          id: string;
        };
        ComputedFields: never;
        Insert: {
          alphabet: string;
          id: string;
        };
        Update: {
          alphabet?: string;
          id?: string;
        };
        Relationships: [];
      };
      learning_operations: {
        Row: {
          id: string;
          payload: NonNullable<Json>;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          id: string;
          payload: NonNullable<Json>;
          user_id: string;
        };
        Update: {
          id?: string;
          payload?: NonNullable<Json>;
          user_id?: string;
        };
        Relationships: [];
      };
      learning_reset_requests: {
        Row: {
          id: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          id: string;
          user_id: string;
        };
        Update: {
          id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      learning_revisions: {
        Row: {
          generation: number;
          revision: number;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          generation?: number;
          revision?: number;
          user_id: string;
        };
        Update: {
          generation?: number;
          revision?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string;
          timezone: string;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          display_name?: string;
          timezone?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          timezone?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      review_events: {
        Row: {
          algorithm: string;
          created_at: string;
          device_id: string;
          id: string;
          kana_id: string;
          rating: number;
          reviewed_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          algorithm: string;
          created_at?: string;
          device_id: string;
          id: string;
          kana_id: string;
          rating: number;
          reviewed_at: string;
          user_id: string;
        };
        Update: {
          algorithm?: string;
          created_at?: string;
          device_id?: string;
          id?: string;
          kana_id?: string;
          rating?: number;
          reviewed_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'review_events_kana_id_fkey';
            columns: ['kana_id'];
            isOneToOne: false;
            referencedRelation: 'kana_catalog';
            referencedColumns: ['id'];
          },
        ];
      };
      user_card_progress: {
        Row: {
          algorithm: string;
          due: string;
          kana_id: string;
          progress: NonNullable<Json>;
          revision: number;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          algorithm: string;
          due: string;
          kana_id: string;
          progress: NonNullable<Json>;
          revision: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          algorithm?: string;
          due?: string;
          kana_id?: string;
          progress?: NonNullable<Json>;
          revision?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_card_progress_kana_id_fkey';
            columns: ['kana_id'];
            isOneToOne: false;
            referencedRelation: 'kana_catalog';
            referencedColumns: ['id'];
          },
        ];
      };
      user_kana_selection: {
        Row: {
          kana_id: string;
          selected: boolean;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          kana_id: string;
          selected: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          kana_id?: string;
          selected?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_kana_selection_kana_id_fkey';
            columns: ['kana_id'];
            isOneToOne: false;
            referencedRelation: 'kana_catalog';
            referencedColumns: ['id'];
          },
        ];
      };
      user_preferences: {
        Row: {
          alphabet: string;
          language: string;
          theme: string;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          alphabet?: string;
          language?: string;
          theme?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          alphabet?: string;
          language?: string;
          theme?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      commit_learning: {
        Args: {
          p_events: Json;
          p_generation?: number;
          p_name?: string;
          p_operations: Json;
          p_progress: Json;
          p_revision: number;
          p_user: string;
        };
        Returns: Json;
      };
      commit_learning_base: {
        Args: {
          p_events: Json;
          p_name?: string;
          p_operations: Json;
          p_progress: Json;
          p_revision: number;
          p_user: string;
        };
        Returns: Json;
      };
      learning_snapshot: { Args: { p_user: string }; Returns: Json };
      learning_snapshot_base: { Args: { p_user: string }; Returns: Json };
      reset_learning: {
        Args: { p_request: string; p_user: string };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
