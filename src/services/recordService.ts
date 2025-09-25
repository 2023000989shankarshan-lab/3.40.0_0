import { Record, Task, Note, Bookmark, PageContext } from '../types';

/**
 * Service for managing records (notes, bookmarks, tasks)
 * Handles CRUD operations and smart content detection
 */
class RecordService {
  private readonly STORAGE_KEY = 'meraki_records';

  // Core CRUD operations
  async getRecords(): Promise<Record[]> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      return result[this.STORAGE_KEY] || [];
    } catch (error) {
      console.error('Error getting records:', error);
      return [];
    }
  }

  async saveRecord(record: Omit<Record, 'id' | 'createdAt' | 'updatedAt'>): Promise<Record> {
    const newRecord: Record = {
      ...record,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const records = await this.getRecords();
    records.push(newRecord);
    await this.saveRecords(records);
    return newRecord;
  }

  async updateRecord(recordId: string, updates: Partial<Record>): Promise<void> {
    const records = await this.getRecords();
    const recordIndex = records.findIndex(r => r.id === recordId);
    
    if (recordIndex === -1) {
      throw new Error('Record not found');
    }

    records[recordIndex] = {
      ...records[recordIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.saveRecords(records);
  }

  async deleteRecord(recordId: string): Promise<void> {
    const records = await this.getRecords();
    const filteredRecords = records.filter(r => r.id !== recordId);
    await this.saveRecords(filteredRecords);
  }

  // Specialized getters
  async getTasks(): Promise<Task[]> {
    const records = await this.getRecords();
    return records.filter(r => r.type === 'task') as Task[];
  }

  async getNotes(): Promise<Note[]> {
    const records = await this.getRecords();
    return records.filter(r => r.type === 'note') as Note[];
  }

  async getBookmarks(): Promise<Bookmark[]> {
    const records = await this.getRecords();
    return records.filter(r => r.type === 'bookmark') as Bookmark[];
  }

  async getRecordsByUrl(url: string): Promise<Record[]> {
    const records = await this.getRecords();
    return records.filter(r => r.url === url);
  }

  async getRecordsBySource(source: Record['source']): Promise<Record[]> {
    const records = await this.getRecords();
    return records.filter(r => r.source === source);
  }

  // Smart content detection and creation
  async createFromPageContext(context: PageContext, type: Record['type'], content: string): Promise<Record> {
    const source = this.detectSource(context);
    const metadata = await this.extractMetadata(context);

    return this.saveRecord({
      type,
      source,
      url: context.url,
      title: context.title,
      content,
      metadata
    });
  }

  // YouTube-specific methods
  async saveYouTubeNote(context: PageContext, content: string, timestamp?: number): Promise<Note> {
    const metadata = await this.extractMetadata(context);
    
    if (timestamp) {
      metadata.timestamp = timestamp;
    }

    const record = await this.saveRecord({
      type: 'note',
      source: 'youtube',
      url: context.url,
      title: context.title,
      content,
      metadata
    });

    return record as Note;
  }

  async addTimestampNote(noteId: string, timestamp: number, content: string): Promise<void> {
    const records = await this.getRecords();
    const note = records.find(r => r.id === noteId && r.type === 'note') as Note;
    
    if (!note) {
      throw new Error('Note not found');
    }

    const timestampNote = {
      id: this.generateId(),
      timestamp,
      content,
      createdAt: new Date().toISOString()
    };

    const timestampNotes = note.timestampNotes || [];
    timestampNotes.push(timestampNote);

    await this.updateRecord(noteId, { 
      timestampNotes,
      metadata: { ...note.metadata, timestamp }
    });
  }

  // Shopping/Booking-specific methods
  async saveShoppingRecord(context: PageContext, content: string, price?: string): Promise<Record> {
    const metadata = await this.extractMetadata(context);
    
    if (price) {
      metadata.price = price;
    }

    return this.saveRecord({
      type: 'task', // Shopping items are typically tasks to review/buy
      source: 'shopping',
      url: context.url,
      title: context.title,
      content,
      metadata
    });
  }

  // Private helper methods
  private async saveRecords(records: Record[]): Promise<void> {
    try {
      await chrome.storage.local.set({ [this.STORAGE_KEY]: records });
      // TODO: Trigger Firebase sync when available
    } catch (error) {
      console.error('Error saving records:', error);
      throw error;
    }
  }

  private detectSource(context: PageContext): Record['source'] {
    const domain = context.domain.toLowerCase();
    
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      return 'youtube';
    }
    
    if (domain.includes('amazon.') || domain.includes('ebay.') || 
        domain.includes('shop') || domain.includes('store')) {
      return 'shopping';
    }
    
    if (domain.includes('booking.') || domain.includes('hotel') || 
        domain.includes('airbnb.') || domain.includes('expedia.')) {
      return 'booking';
    }
    
    return 'generic';
  }

  private async extractMetadata(context: PageContext): Promise<Record['metadata']> {
    const metadata: Record['metadata'] = {
      domain: context.domain,
      favicon: context.favicon
    };

    // YouTube-specific metadata
    if (context.metadata?.isYouTube && context.metadata.videoId) {
      metadata.videoId = context.metadata.videoId;
      // TODO: Extract duration, channel info when available
    }

    // Shopping-specific metadata
    if (context.metadata?.isShopping && context.metadata.productInfo) {
      // TODO: Extract product details, price, rating
    }

    return metadata;
  }

  private generateId(): string {
    return `meraki_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const recordService = new RecordService();