/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Article {
  id: string;
  title: string;
  category: string;
  source: string;
  date: string;
  imageUrl: string;
  content: string[];
  linkUrl?: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'security' | 'news' | 'hoax' | 'system';
  isUnread: boolean;
  priority?: 'high' | 'normal';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isTyping?: boolean;
  alert?: {
    type: 'warning' | 'info' | 'success';
    title: string;
    description: string;
    action: string;
  };
}

export interface HoaxResult {
  isHoax: boolean;
  title: string;
  badge: string;
  explanation: string;
  confidence: number;
}

export interface LinkResult {
  isSafe: boolean;
  title: string;
  registered: boolean;
  sslValid: boolean;
  notBlacklisted: boolean;
  explanation: string;
}

export interface FeedbackSubmission {
  rating: number;
  category: 'Masalah Teknis' | 'Saran Fitur' | 'Konten Berita' | 'Lainnya';
  message: string;
  email?: string;
}
