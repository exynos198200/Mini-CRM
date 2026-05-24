/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  LOST = 'LOST',
  WON = 'WON'
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  status: LeadStatus;
  comment: string;
  dealValue?: number;
  createdAt: string;
}

export interface RealtimeEvent {
  id: string;
  type: 'NEW_LEAD' | 'STATUS_CHANGED' | 'LEAD_DELETED' | 'COMMENT_ADDED';
  message: string;
  timestamp: string;
  targetId: string;
  payload?: any;
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  title: string;
  description: string;
  requestBody?: string;
  responseBody: string;
  statusCodes: { code: number; description: string }[];
}

export interface FileTreeNode {
  name: string;
  type: 'file' | 'dir';
  children?: FileTreeNode[];
  path: string;
  description?: string;
}
