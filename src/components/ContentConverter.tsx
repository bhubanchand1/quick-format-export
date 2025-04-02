
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowDownToLine, Clipboard } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow
} from "@/components/ui/table";

interface ContentItem {
  id: number;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
}

const ContentConverter = () => {
  const [inputContent, setInputContent] = useState('');
  const [parsedData, setParsedData] = useState<ContentItem | null>(null);
  const [error, setError] = useState('');

  // Parse content immediately when input changes
  useEffect(() => {
    if (inputContent.trim()) {
      parseContent();
    }
  }, [inputContent]);

  const parseContent = () => {
    try {
      setError('');
      
      if (!inputContent.trim()) {
        setParsedData(null);
        return;
      }

      // Extract fields using regex patterns
      const slugMatch = /slug:\s*(.+?)(?=\s*title:|$)/s.exec(inputContent);
      const titleMatch = /title:\s*(.+?)(?=\s*category:|$)/s.exec(inputContent);
      const categoryMatch = /category:\s*(.+?)(?=\s*excerpt:|$)/s.exec(inputContent);
      const excerptMatch = /excerpt:\s*(.+?)(?=\s*content:|$)/s.exec(inputContent);
      const contentMatch = /content:\s*\|\s*(.+?)(?=\s*image:|$)/s.exec(inputContent);
      const imageMatch = /image:\s*(.+?)$/s.exec(inputContent);

      if (!slugMatch || !titleMatch || !categoryMatch || !excerptMatch || !contentMatch || !imageMatch) {
        setError('Invalid format. Please check your input content format.');
        return;
      }

      const parsedContent: ContentItem = {
        id: Date.now(),
        slug: slugMatch[1].trim(),
        title: titleMatch[1].trim(),
        category: categoryMatch[1].trim(),
        excerpt: excerptMatch[1].trim(),
        content: contentMatch[1].trim(),
        image: imageMatch[1].trim()
      };

      setParsedData(parsedContent);
    } catch (err) {
      console.error('Parsing error:', err);
      setError('Error parsing content. Please check the format and try again.');
    }
  };

  const copyToClipboard = () => {
    if (!parsedData) return;
    
    try {
      // Copy only the data values (no headers) in a tab-separated format
      const dataValues = [
        parsedData.id.toString(),
        parsedData.slug,
        parsedData.title,
        parsedData.category,
        parsedData.excerpt,
        parsedData.content,
        parsedData.image
      ].join('\t');
      
      navigator.clipboard.writeText(dataValues);
      toast.success('Data copied to clipboard!');
    } catch (err) {
      console.error('Clipboard error:', err);
      toast.error('Failed to copy to clipboard');
    }
  };

  const exportAsCSV = () => {
    if (!parsedData) return;
    
    try {
      // Create CSV with just the data row (no headers)
      const values = [
        parsedData.id.toString(),
        parsedData.slug,
        parsedData.title,
        parsedData.category,
        parsedData.excerpt,
        parsedData.content,
        parsedData.image
      ];
      
      // Escape fields for CSV
      const escapedValues = values.map(value => {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      
      const csvContent = escapedValues.join(',');
      
      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `content_${parsedData.slug}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('CSV file downloaded!');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export CSV');
    }
  };

  return (
    <div className="max-w-full mx-auto px-4 py-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Content to Sheet Converter</h1>
        <p className="text-muted-foreground">Paste structured content to convert it into a spreadsheet format</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Input Area */}
        <Card className="p-6">
          <label htmlFor="content-input" className="block text-sm font-medium mb-2">
            Paste your content:
          </label>
          <Textarea
            id="content-input"
            placeholder="Paste content in the format: slug: value, title: value, etc..."
            className="min-h-[200px] font-mono text-sm"
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
          />
          {error && (
            <p className="text-destructive text-sm mt-2">{error}</p>
          )}
        </Card>

        {/* Sheet View */}
        {parsedData && (
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Sheet View</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={copyToClipboard} className="flex items-center gap-2">
                  <Clipboard className="w-4 h-4" />
                  <span>Copy Data</span>
                </Button>
                <Button onClick={exportAsCSV} className="flex items-center gap-2">
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>Export CSV</span>
                </Button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableBody>
                  {/* Row with field names */}
                  <TableRow className="bg-muted font-medium">
                    <TableCell>ID</TableCell>
                    <TableCell>Slug</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Excerpt</TableCell>
                    <TableCell>Content</TableCell>
                    <TableCell>Image</TableCell>
                  </TableRow>
                  
                  {/* Row with data values */}
                  <TableRow>
                    <TableCell className="whitespace-nowrap">{parsedData.id}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{parsedData.slug}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{parsedData.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{parsedData.category}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={parsedData.excerpt}>
                      {parsedData.excerpt}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={parsedData.content}>
                      {parsedData.content.substring(0, 50)}...
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={parsedData.image}>
                      {parsedData.image}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ContentConverter;
