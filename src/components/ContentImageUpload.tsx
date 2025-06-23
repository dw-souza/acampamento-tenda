import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Settings } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '../hooks/use-toast';

interface ContentImageUploadProps {
  onImageUploaded: (html: string) => void;
  className?: string;
}

export default function ContentImageUpload({ 
  onImageUploaded, 
  className = ''
}: ContentImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [imageAlt, setImageAlt] = useState('');
  const [imageSize, setImageSize] = useState('auto');
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `blog/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      // Generate HTML based on settings
      const html = generateImageHTML(publicUrl);
      onImageUploaded(html);
      
      toast({
        title: "Imagem inserida no conteúdo",
        description: "A imagem foi adicionada ao conteúdo com as configurações selecionadas.",
      });

      // Reset file input and settings
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setImageAlt('');
      setImageSize('auto');
      setCustomWidth('');
      setCustomHeight('');
      setShowSettings(false);

    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar imagem",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const generateImageHTML = (url: string): string => {
    const alt = imageAlt || 'Imagem do post';
    let style = '';
    let width = '';
    let height = '';

    switch (imageSize) {
      case 'small':
        style = 'width: 300px; height: auto;';
        break;
      case 'medium':
        style = 'width: 500px; height: auto;';
        break;
      case 'large':
        style = 'width: 800px; height: auto;';
        break;
      case 'full':
        style = 'width: 100%; height: auto;';
        break;
      case 'custom':
        if (customWidth) width = ` width="${customWidth}"`;
        if (customHeight) height = ` height="${customHeight}"`;
        break;
      default:
        style = 'max-width: 100%; height: auto;';
    }

    if (imageSize === 'custom') {
      return `<img src="${url}" alt="${alt}"${width}${height} class="my-4 rounded-lg shadow mx-auto" />`;
    } else {
      return `<img src="${url}" alt="${alt}" style="${style}" class="my-4 rounded-lg shadow mx-auto" />`;
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Configurações da Imagem</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(false)}
            >
              ×
            </Button>
          </div>
          
          <div>
            <Label htmlFor="imageAlt" className="text-xs">Texto alternativo</Label>
            <Input
              id="imageAlt"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="Descrição da imagem"
              className="text-sm"
            />
          </div>

          <div>
            <Label htmlFor="imageSize" className="text-xs">Tamanho</Label>
            <Select value={imageSize} onValueChange={setImageSize}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Automático</SelectItem>
                <SelectItem value="small">Pequeno (300px)</SelectItem>
                <SelectItem value="medium">Médio (500px)</SelectItem>
                <SelectItem value="large">Grande (800px)</SelectItem>
                <SelectItem value="full">Largura total</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {imageSize === 'custom' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="customWidth" className="text-xs">Largura</Label>
                <Input
                  id="customWidth"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                  placeholder="ex: 400px"
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="customHeight" className="text-xs">Altura</Label>
                <Input
                  id="customHeight"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(e.target.value)}
                  placeholder="ex: 300px"
                  className="text-sm"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed border-gray-300 rounded-lg 
          flex flex-col items-center justify-center p-4
          transition-colors cursor-pointer
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Enviando...</p>
          </div>
        ) : (
          <div className="text-center">
            <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Clique ou arraste uma imagem para inserir no conteúdo
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG até 5MB
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? 'Enviando...' : 'Adicionar Imagem'}
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          disabled={uploading}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
} 