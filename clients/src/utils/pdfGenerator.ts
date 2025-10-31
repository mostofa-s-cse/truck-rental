import jsPDF from 'jspdf';

export interface PDFReportData {
  title: string;
  subtitle?: string;
  generatedAt: string;
  filters?: Record<string, unknown>;
  sections: PDFSection[];
}

export interface PDFSection {
  title: string;
  type: 'text' | 'table' | 'chart' | 'metrics';
  data: string | Record<string, unknown> | Record<string, unknown>[];
}

export class PDFGenerator {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageWidth: number = 210;
  private pageHeight: number = 297;
  private margin: number = 20;
  private lineHeight: number = 7;

  constructor() {
    this.doc = new jsPDF();
  }

  async generatePDF(reportData: PDFReportData): Promise<Blob> {
    // Set up the document with beautiful styling
    this.doc.setFont('helvetica');
    
    // Add beautiful header with gradient effect
    this.doc.setFillColor(59, 130, 246); // Blue background
    this.doc.rect(0, 0, this.pageWidth, 45, 'F');
    
    // Add title with white text
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(reportData.title, this.margin, 30);
    
    // Add subtitle
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(reportData.subtitle || '', this.margin, 40);
    
    // Reset text color and position
    this.doc.setTextColor(0, 0, 0);
    this.currentY = 55;
    
    // Add generation info with styled box
    this.doc.setFillColor(249, 250, 251); // Light gray background
    this.doc.roundedRect(this.margin - 5, this.currentY - 8, this.pageWidth - 30, 15, 3, 3, 'F');
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Generated: ${new Date(reportData.generatedAt).toLocaleString()}`, this.margin, this.currentY);
    this.currentY += 20;
    
    // Add filters if provided with styled box
    if (reportData.filters && Object.keys(reportData.filters).length > 0) {
      this.doc.setFillColor(254, 243, 199); // Light yellow background
      this.doc.roundedRect(this.margin - 5, this.currentY - 8, this.pageWidth - 30, 25, 3, 3, 'F');
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Filters Applied:', this.margin, this.currentY);
      this.currentY += 8;
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      const filterText = this.formatFilters(reportData.filters);
      this.doc.text(filterText, this.margin, this.currentY);
      this.currentY += 20;
    }

    // Add sections with improved styling
    for (let i = 0; i < reportData.sections.length; i++) {
      const section = reportData.sections[i];
      
      // Add section divider
      if (i > 0) {
        this.doc.setDrawColor(229, 231, 235);
        this.doc.line(this.margin, this.currentY - 5, this.pageWidth - this.margin, this.currentY - 5);
        this.currentY += 10;
      }
      
      await this.addSection(section.title, section.type, section.data);
    }

    return this.doc.output('blob');
  }

  private formatFilters(filters: Record<string, unknown>): string {
    return Object.entries(filters)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }

  private async addSection(title: string, type: string, data: unknown): Promise<void> {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 50) {
      this.doc.addPage();
      this.currentY = 20;
    }

    // Add section title with styled background
    this.doc.setFillColor(243, 244, 246); // Light gray background
    this.doc.roundedRect(this.margin - 5, this.currentY - 8, this.pageWidth - 30, 12, 3, 3, 'F');
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(31, 41, 55); // Dark gray text
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 15;

    // Add section content based on type
    switch (type) {
      case 'text':
        this.addTextContent(data as string);
        break;
      case 'table':
        this.addTableContent(data as Record<string, unknown>[]);
        break;
      case 'metrics':
        this.addMetricsContent(data as Record<string, unknown>);
        break;
      case 'chart':
        await this.addChartContent(data as Record<string, unknown>);
        break;
    }

    this.currentY += 10;
  }

  private addTextContent(text: string): void {
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    const lines = this.doc.splitTextToSize(text, this.pageWidth - 2 * this.margin);
    
    for (const line of lines) {
      if (this.currentY > this.pageHeight - 20) {
        this.doc.addPage();
        this.currentY = 20;
      }
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }
  }

  private addTableContent(tableData: Record<string, unknown>[]): void {
    if (!tableData || tableData.length === 0) {
      this.addTextContent('No data available');
      return;
    }

    this.doc.setFontSize(9); // Slightly larger font for better readability
    this.doc.setFont('helvetica', 'normal');

    const headers = Object.keys(tableData[0]);
    const availableWidth = this.pageWidth - 2 * this.margin;
    
    // Calculate column widths based on content
    const colWidths = this.calculateColumnWidths(tableData, headers, availableWidth);
    let startY = this.currentY;

    // Draw headers with enhanced styling
    this.doc.setFillColor(59, 130, 246); // Blue background
    this.doc.roundedRect(this.margin, startY - 3, availableWidth, 10, 2, 2, 'F');
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255); // White text
    
    let currentX = this.margin;
    headers.forEach((header) => {
      const text = this.truncateText(header, colWidths[headers.indexOf(header)] - 2);
      this.doc.text(text, currentX + 1, startY + 2);
      currentX += colWidths[headers.indexOf(header)];
    });
    
    startY += 8;
    this.doc.setTextColor(0, 0, 0); // Reset text color

    startY += 5;
    this.doc.setFont('helvetica', 'normal');

    // Draw data rows with dynamic row height
    tableData.slice(0, 20).forEach((row) => { // Limit to 20 rows
      const rowHeight = this.calculateRowHeight(row, headers, colWidths);
      
      if (startY + rowHeight > this.pageHeight - 30) {
        this.doc.addPage();
        startY = 20;
      }

      currentX = this.margin;
      headers.forEach((header) => {
        const value = String(row[header] || '');
        const colIndex = headers.indexOf(header);
        const text = this.truncateText(value, colWidths[colIndex] - 2);
        this.doc.text(text, currentX, startY);
        currentX += colWidths[colIndex];
      });
      
      startY += rowHeight;
    });

    this.currentY = startY + 10;
  }

  private calculateRowHeight(row: Record<string, unknown>, headers: string[], colWidths: number[]): number {
    let maxLines = 1;
    
    headers.forEach((header, index) => {
      const value = String(row[header] || '');
      const lines = this.getTextLines(value, colWidths[index] - 2);
      maxLines = Math.max(maxLines, lines);
    });
    
    return maxLines * 4 + 2; // 4 points per line + 2 points padding
  }

  private getTextLines(text: string, maxWidth: number): number {
    if (text.length <= maxWidth / 3) {
      return 1;
    }
    
    const words = text.split(' ');
    let currentLine = '';
    let lines = 1;
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      if (testLine.length <= maxWidth / 3) {
        currentLine = testLine;
      } else {
        lines++;
        currentLine = word;
      }
    }
    
    return lines;
  }

  private calculateColumnWidths(tableData: Record<string, unknown>[], headers: string[], availableWidth: number): number[] {
    // Define minimum and maximum column widths
    const minWidth = 20;
    const maxWidth = 80; // Increased max width for better text display
    
    // Calculate content-based widths with special handling for route columns
    const contentWidths = headers.map((header) => {
      const headerLength = header.length;
      const maxContentLength = Math.max(
        headerLength,
        ...tableData.map(row => String(row[header] || '').length)
      );
      
      // Give more space to route-related columns
      const multiplier = header.toLowerCase().includes('route') ? 4 : 3;
      return Math.min(Math.max(maxContentLength * multiplier, minWidth), maxWidth);
    });

    // Normalize widths to fit available space
    const totalContentWidth = contentWidths.reduce((sum, width) => sum + width, 0);
    const scaleFactor = availableWidth / totalContentWidth;
    
    return contentWidths.map(width => Math.floor(width * scaleFactor));
  }

  private truncateText(text: string, maxWidth: number): string {
    if (text.length <= maxWidth / 3) {
      return text;
    }
    
    // Try to truncate at word boundaries
    const words = text.split(' ');
    let result = '';
    
    for (const word of words) {
      const testResult = result + (result ? ' ' : '') + word;
      if (testResult.length <= maxWidth / 3) {
        result = testResult;
      } else {
        break;
      }
    }
    
    if (result) {
      return result + '...';
    }
    
    // If no words fit, truncate with ellipsis
    return text.substring(0, Math.floor(maxWidth / 3) - 3) + '...';
  }

  private addMetricsContent(metrics: Record<string, unknown>): void {
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    const entries = Object.entries(metrics);
    const itemsPerRow = 2;
    
    for (let i = 0; i < entries.length; i += itemsPerRow) {
      const row = entries.slice(i, i + itemsPerRow);
      
      if (this.currentY > this.pageHeight - 30) {
        this.doc.addPage();
        this.currentY = 20;
      }
      
      row.forEach(([key, value], index) => {
        const x = this.margin + (index * (this.pageWidth - 2 * this.margin) / itemsPerRow);
        const boxWidth = (this.pageWidth - 2 * this.margin) / itemsPerRow - 10;
        
        // Draw metric box with background
        this.doc.setFillColor(249, 250, 251); // Light gray background
        this.doc.roundedRect(x, this.currentY - 3, boxWidth, 20, 3, 3, 'F');
        
        // Key
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(31, 41, 55); // Dark gray
        this.doc.text(key, x + 5, this.currentY + 3);
        
        // Value
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(59, 130, 246); // Blue
        this.doc.text(String(value), x + 5, this.currentY + 10);
      });
      
      this.currentY += 25;
    }
  }

  private async addChartContent(chartData: Record<string, unknown>): Promise<void> {
    // For now, we'll add chart data as text
    // In a real implementation, you might want to render charts to canvas and embed them
    this.addTextContent('Chart data: ' + JSON.stringify(chartData, null, 2));
  }

  // Utility method to create a simple metrics section
  static createMetricsSection(title: string, metrics: Record<string, unknown>): PDFSection {
    return {
      title,
      type: 'metrics',
      data: metrics
    };
  }

  // Utility method to create a text section
  static createTextSection(title: string, text: string): PDFSection {
    return {
      title,
      type: 'text',
      data: text
    };
  }

  // Utility method to create a table section
  static createTableSection(title: string, data: Record<string, unknown>[]): PDFSection {
    return {
      title,
      type: 'table',
      data
    };
  }
}

// Helper function to download PDF
export const downloadPDF = async (reportData: PDFReportData, filename: string): Promise<void> => {
  try {
    const generator = new PDFGenerator();
    const blob = await generator.generatePDF(reportData);
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}; 