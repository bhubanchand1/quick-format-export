
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
    } else {
      setParsedData(null);
    }
  }, [inputContent]);

  const parseContent = () => {
    try {
      setError('');
      
      if (!inputContent.trim()) {
        setParsedData(null);
        return;
      }

      // Extract fields using improved regex patterns that don't depend on field order
      // These patterns look for field names followed by content until the next field or end of text
      const extractField = (fieldName: string): string => {
        const pattern = new RegExp(`${fieldName}:\\s*(.+?)(?=\\s*(?:slug:|title:|category:|excerpt:|content:|image:)|$)`, 'is');
        const match = pattern.exec(inputContent);
        return match ? match[1].trim() : '';
      };

      // Extract fields regardless of order
      const slug = extractField('slug');
      const title = extractField('title');
      const category = extractField('category');
      const excerpt = extractField('excerpt');
      
      // Special handling for content field which might have pipe character
      const contentPattern = /content:\s*\|\s*(.+?)(?=\s*(?:slug:|title:|category:|excerpt:|image:)|$)/is;
      const contentMatch = contentPattern.exec(inputContent);
      const content = contentMatch ? contentMatch[1].trim() : extractField('content');
      
      const image = extractField('image');

      // Validate that we have at least the essential fields
      if (!slug && !title && !content) {
        setError('Could not extract required fields. Please check your input format.');
        return;
      }

      const parsedContent: ContentItem = {
        id: Date.now(),
        slug: slug || 'no-slug-found',
        title: title || 'No Title Found',
        category: category || 'Uncategorized',
        excerpt: excerpt || 'No excerpt available',
        content: content || 'No content available',
        image: image || 'No image URL provided'
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
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-gray-800">Content to Sheet Converter</h1>
        <p className="text-gray-600">Paste structured content to convert it into a spreadsheet format</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Input Area */}
        <Card className="p-6 bg-white border-gray-200">
          <label htmlFor="content-input" className="block text-sm font-medium mb-2 text-gray-700">
            Paste your content:
          </label>
          <Textarea
            id="content-input"
            placeholder="Paste content in any order: slug: value, title: value, etc..."
            className="min-h-[200px] font-mono text-sm bg-white border-gray-300 text-gray-800"
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
          />
          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
        </Card>

        {/* Sheet View */}
        {parsedData && (
          <Card className="p-6 bg-white border-gray-200">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Sheet View</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={copyToClipboard} className="flex items-center gap-2 bg-white border-gray-300 text-gray-800 hover:bg-gray-100">
                  <Clipboard className="w-4 h-4" />
                  <span>Copy Data</span>
                </Button>
                <Button onClick={exportAsCSV} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>Export CSV</span>
                </Button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableBody>
                  {/* Row with field names */}
                  <TableRow className="bg-gray-100 font-medium">
                    <TableCell className="text-gray-700">ID</TableCell>
                    <TableCell className="text-gray-700">Slug</TableCell>
                    <TableCell className="text-gray-700">Title</TableCell>
                    <TableCell className="text-gray-700">Category</TableCell>
                    <TableCell className="text-gray-700">Excerpt</TableCell>
                    <TableCell className="text-gray-700">Content</TableCell>
                    <TableCell className="text-gray-700">Image</TableCell>
                  </TableRow>
                  
                  {/* Row with data values */}
                  <TableRow>
                    <TableCell className="whitespace-nowrap text-gray-700">{parsedData.id}</TableCell>
                    <TableCell className="text-gray-700">{parsedData.slug}</TableCell>
                    <TableCell className="text-gray-700">{parsedData.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">{parsedData.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-h-32 overflow-y-auto text-gray-700">
                        {parsedData.excerpt}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-h-32 overflow-y-auto text-gray-700">
                        <code className="whitespace-pre-wrap">{parsedData.content}</code>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      <div className="max-w-md overflow-x-auto text-gray-700">
                        {parsedData.image}
                      </div>
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
