-- 邻里社区APP Cloudflare D1 数据库 Schema
-- 创建时间: 2026-06-06

PRAGMA foreign_keys = ON;

-- 用户表 (users)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  nickname TEXT NOT NULL,
  avatar TEXT,
  gender TEXT CHECK(gender IN ('male', 'female', 'other')),
  birthday TEXT,
  community TEXT NOT NULL,
  address TEXT,
  bio TEXT,
  role TEXT NOT NULL DEFAULT 'resident' CHECK(role IN ('resident', 'elderly', 'volunteer', 'merchant')),
  credit_score INTEGER NOT NULL DEFAULT 100,
  is_verified BOOLEAN NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  last_active_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX idx_users_community ON users(community);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- 动态/帖子表 (posts)
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  images TEXT,
  location TEXT,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK(visibility IN ('public', 'community', 'private')),
  like_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_community ON posts(user_id) WHERE 1=1;
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_visibility ON posts(visibility);

-- 评论表 (comments)
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  parent_comment_id TEXT,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- 互助任务表 (tasks)
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  helper_id TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other' CHECK(category IN ('shopping', 'delivery', 'help', 'companionship', 'other')),
  location TEXT NOT NULL,
  reward TEXT,
  deadline INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (helper_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_helper_id ON tasks(helper_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);

-- 活动表 (activities)
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other' CHECK(category IN ('sports', 'culture', 'charity', 'party', 'other')),
  location TEXT NOT NULL,
  start_time INTEGER NOT NULL,
  end_time INTEGER,
  max_participants INTEGER,
  current_participants INTEGER NOT NULL DEFAULT 0,
  images TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_category ON activities(category);
CREATE INDEX idx_activities_start_time ON activities(start_time);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);

-- 活动参与者表 (activity_participants)
CREATE TABLE IF NOT EXISTS activity_participants (
  id TEXT PRIMARY KEY,
  activity_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  joined_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  status TEXT NOT NULL DEFAULT 'registered' CHECK(status IN ('registered', 'attended', 'absent')),
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(activity_id, user_id)
);

CREATE INDEX idx_activity_participants_activity_id ON activity_participants(activity_id);
CREATE INDEX idx_activity_participants_user_id ON activity_participants(user_id);

-- 点赞表 (likes)
CREATE TABLE IF NOT EXISTS likes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK(target_type IN ('post', 'comment', 'activity')),
  target_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, target_type, target_id)
);

CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_target ON likes(target_type, target_id);

-- 触发器：更新用户最后活跃时间
CREATE TRIGGER IF NOT EXISTS update_user_last_active
AFTER INSERT ON posts
BEGIN
  UPDATE users SET last_active_at = strftime('%s', 'now') WHERE id = NEW.user_id;
END;

CREATE TRIGGER IF NOT EXISTS update_user_last_active_comment
AFTER INSERT ON comments
BEGIN
  UPDATE users SET last_active_at = strftime('%s', 'now') WHERE id = NEW.user_id;
END;

CREATE TRIGGER IF NOT EXISTS update_user_last_active_task
AFTER INSERT ON tasks
BEGIN
  UPDATE users SET last_active_at = strftime('%s', 'now') WHERE id = NEW.user_id;
END;

CREATE TRIGGER IF NOT EXISTS update_user_last_active_activity
AFTER INSERT ON activities
BEGIN
  UPDATE users SET last_active_at = strftime('%s', 'now') WHERE id = NEW.user_id;
END;

-- 触发器：帖子点赞计数更新
CREATE TRIGGER IF NOT EXISTS increment_post_likes
AFTER INSERT ON likes
WHEN NEW.target_type = 'post'
BEGIN
  UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.target_id;
END;

CREATE TRIGGER IF NOT EXISTS decrement_post_likes
AFTER DELETE ON likes
WHEN OLD.target_type = 'post'
BEGIN
  UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.target_id;
END;

-- 触发器：帖子评论计数更新
CREATE TRIGGER IF NOT EXISTS increment_post_comments
AFTER INSERT ON comments
BEGIN
  UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
END;

CREATE TRIGGER IF NOT EXISTS decrement_post_comments
AFTER DELETE ON comments
BEGIN
  UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
END;

-- 触发器：活动参与者计数更新
CREATE TRIGGER IF NOT EXISTS increment_activity_participants
AFTER INSERT ON activity_participants
WHEN NEW.status = 'registered'
BEGIN
  UPDATE activities SET current_participants = current_participants + 1 WHERE id = NEW.activity_id;
END;

CREATE TRIGGER IF NOT EXISTS decrement_activity_participants
AFTER DELETE ON activity_participants
WHEN OLD.status = 'registered'
BEGIN
  UPDATE activities SET current_participants = current_participants - 1 WHERE id = OLD.activity_id;
END;
