-- Run in Supabase SQL Editor

-- Follows
CREATE TABLE follows (
  follower_id  uuid REFERENCES profiles(id) ON DELETE CASCADE,
  followed_id  uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   timestamptz DEFAULT now(),
  PRIMARY KEY (follower_id, followed_id),
  CHECK (follower_id <> followed_id)
);
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "follows_select" ON follows FOR SELECT USING (true);
CREATE POLICY "follows_insert" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete" ON follows FOR DELETE USING (auth.uid() = follower_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_followed ON follows(followed_id);

-- Posts createurs
CREATE TABLE posts (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content       text NOT NULL CHECK (char_length(content) <= 280),
  images        text[] NOT NULL DEFAULT '{}',
  hashtags      text[] NOT NULL DEFAULT '{}',
  post_type     text NOT NULL DEFAULT 'general'
                CHECK (post_type IN ('guest_appearance','call_for_collab','tip','experience','general')),
  event_ref     text,
  location_name text,
  lat           float,
  lng           float,
  likes_count   int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts_select" ON posts FOR SELECT USING (true);
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "posts_update" ON posts FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "posts_delete" ON posts FOR DELETE USING (auth.uid() = creator_id);
CREATE INDEX idx_posts_creator   ON posts(creator_id, created_at DESC);
CREATE INDEX idx_posts_created   ON posts(created_at DESC);
CREATE INDEX idx_posts_hashtags  ON posts USING GIN(hashtags);

-- Likes
CREATE TABLE post_likes (
  user_id    uuid REFERENCES profiles(id) ON DELETE CASCADE,
  post_id    uuid REFERENCES posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pl_select" ON post_likes FOR SELECT USING (true);
CREATE POLICY "pl_insert" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pl_delete" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- Trigger: update likes_count on posts
CREATE OR REPLACE FUNCTION sync_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_likes_count
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION sync_likes_count();
