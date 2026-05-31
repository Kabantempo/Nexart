export type UserRole = 'creator' | 'organizer';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface CreatorProfile {
  id: string;
  user_id: string;
  category: string;
  location: string;
  city: string;
  department: string;
  website: string | null;
  instagram: string | null;
  portfolio_images: string[];
}

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  location: string;
  city: string;
  department: string;
  start_date: string;
  end_date: string;
  stand_count: number;
  stand_price: number | null;
  category_tags: string[];
  status: 'draft' | 'published' | 'closed';
  cover_image: string | null;
  created_at: string;
}

export type ApplicationStatus = 'pending' | 'accepted' | 'refused';

export interface Application {
  id: string;
  event_id: string;
  creator_id: string;
  message: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  event_id: string;
  creator_id: string;
  organizer_id: string;
  created_at: string;
}
