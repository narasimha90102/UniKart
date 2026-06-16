export interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phoneNumber?: string;
  avatar?: string;
  isVerified: boolean;
  verificationStatus: 'incomplete' | 'pending' | 'verified';
  profileCompletionPercentage: number;
  wishlist?: string[];
  balance?: number;
}

export interface Category {
  _id: string;
  name: string;
  icon?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: Category | string;
  condition: 'new' | 'like_new' | 'good' | 'fair';
  status: 'active' | 'sold' | 'pending';
  images: string[];
  seller: User | string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  chatId: string;
  sender: string | User;
  senderModel: 'User' | 'Admin';
  message: string;
  createdAt: string;
}

export interface ChatRoom {
  _id: string;
  buyer: User | string;
  seller: User | string;
  product: Product | string;
  messages: ChatMessage[];
  lastMessage?: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  product: Product | string;
  buyer: User | string;
  seller: User | string;
  price: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}
