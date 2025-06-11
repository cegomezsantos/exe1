// Función para limpiar markdown básico del texto
export const cleanMarkdown = (text: string): string => {
  return text
    // Remover negritas (**texto** o __texto__)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    
    // Remover cursivas (*texto* o _texto_)
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    
    // Remover código (`texto`)
    .replace(/`(.*?)`/g, '$1')
    
    // Remover enlaces [texto](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    
    // Remover encabezados (# ## ###)
    .replace(/^#+\s+/gm, '')
    
    // Remover listas (- * +)
    .replace(/^[\-\*\+]\s+/gm, '• ')
    
    // Limpiar espacios extra
    .replace(/\s+/g, ' ')
    .trim()
}

// Función para formatear texto manteniendo saltos de línea naturales
export const formatChatText = (text: string): string => {
  const cleaned = cleanMarkdown(text)
  
  // Mantener párrafos separados
  return cleaned
    .replace(/\n\s*\n/g, '\n\n')
    .replace(/\n/g, '\n')
    .trim()
} 