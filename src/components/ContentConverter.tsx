
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowDownToLine, Clipboard, Table, Eye, FileText } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState('input');

  const parseContent = () => {
    try {
      setError('');
      
      // Basic validation
      if (!inputContent.trim()) {
        setError('Please enter content to parse');
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
      setActiveTab('preview');
      toast.success('Content parsed successfully!');
    } catch (err) {
      console.error('Parsing error:', err);
      setError('Error parsing content. Please check the format and try again.');
      toast.error('Failed to parse content');
    }
  };

  const copyToClipboard = () => {
    if (!parsedData) return;
    
    try {
      // Create a table format for clipboard
      const tableData = [
        ['id', 'slug', 'title', 'category', 'excerpt', 'content', 'image'],
        [
          parsedData.id.toString(),
          parsedData.slug,
          parsedData.title,
          parsedData.category,
          parsedData.excerpt,
          parsedData.content,
          parsedData.image
        ]
      ];
      
      // Convert to TSV (tab-separated values) for pasting into spreadsheets
      const tsvData = tableData.map(row => row.join('\t')).join('\n');
      navigator.clipboard.writeText(tsvData);
      toast.success('Table data copied to clipboard!');
    } catch (err) {
      console.error('Clipboard error:', err);
      toast.error('Failed to copy to clipboard');
    }
  };

  const exportAsCSV = () => {
    if (!parsedData) return;
    
    try {
      // Create CSV content
      const headers = ['id', 'slug', 'title', 'category', 'excerpt', 'content', 'image'];
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
        // Escape quotes and wrap in quotes if needed
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      
      const csvContent = [
        headers.join(','),
        escapedValues.join(',')
      ].join('\n');
      
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
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Content to Table Converter</h1>
        <p className="text-muted-foreground">Paste structured content to convert it into a tabular format</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="input" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Input Content</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2" disabled={!parsedData}>
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2" disabled={!parsedData}>
            <Table className="h-4 w-4" />
            <span>Table View</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="fade-in">
          <Card className="p-6 space-y-4">
            <div>
              <label htmlFor="content-input" className="block text-sm font-medium mb-2">
                Paste your structured content:
              </label>
              <Textarea
                id="content-input"
                placeholder="Paste content in the specified format..."
                className="min-h-[300px] font-mono text-sm"
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
              />
              {error && (
                <p className="text-destructive text-sm mt-2">{error}</p>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button onClick={parseContent} className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>Parse Content</span>
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="fade-in">
          {parsedData ? (
            <Card className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Slug</h3>
                    <p className="font-mono text-sm">{parsedData.slug}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Title</h3>
                    <p className="font-medium">{parsedData.title}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                    <Badge variant="outline">{parsedData.category}</Badge>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Excerpt</h3>
                    <p className="text-sm">{parsedData.excerpt}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Image URL</h3>
                    <p className="text-xs font-mono break-all">{parsedData.image}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Content Preview</h3>
                <div className="bg-muted p-4 rounded-md content-preview">
                  <code className="text-xs">{parsedData.content}</code>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setActiveTab('table')} className="flex items-center gap-2">
                  <Table className="w-4 h-4" />
                  <span>View as Table</span>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No content parsed yet. Start by pasting content in the Input tab.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="table" className="fade-in">
          {parsedData ? (
            <Card className="p-6 space-y-6">
              <div className="table-container border rounded-md">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Slug</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Excerpt</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Content</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Image</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-3 text-sm">{parsedData.id}</td>
                      <td className="px-4 py-3 text-sm">{parsedData.slug}</td>
                      <td className="px-4 py-3 text-sm">{parsedData.title}</td>
                      <td className="px-4 py-3 text-sm">{parsedData.category}</td>
                      <td className="px-4 py-3 text-sm content-cell" title={parsedData.excerpt}>
                        {parsedData.excerpt}
                      </td>
                      <td className="px-4 py-3 text-sm content-cell" title={parsedData.content}>
                        {parsedData.content.substring(0, 100)}...
                      </td>
                      <td className="px-4 py-3 text-sm content-cell" title={parsedData.image}>
                        {parsedData.image}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={copyToClipboard} className="flex items-center gap-2">
                  <Clipboard className="w-4 h-4" />
                  <span>Copy to Clipboard</span>
                </Button>
                <Button onClick={exportAsCSV} className="flex items-center gap-2">
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>Export as CSV</span>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No table data available. Parse some content first.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentConverter;
