import re
import os
from pathlib import Path

# Mapeamento de nomes PascalCase para kebab-case
icon_mapping = {
    'CheckCircle2': 'check-circle-2',
    'TrendingUp': 'trending-up',
    'Users': 'users',
    'Award': 'award',
    'AlertTriangle': 'alert-triangle',
    'ArrowRight': 'arrow-right',
    'Target': 'target',
    'FileText': 'file-text',
    'XCircle': 'x-circle',
    'X': 'x',
    'Shield': 'shield',
    'Lock': 'lock',
    'Eye': 'eye',
    'UserCheck': 'user-check',
    'Mail': 'mail',
    'MapPin': 'map-pin',
    'Clock': 'clock',
    'Send': 'send',
    'Phone': 'phone',
    'MessageSquare': 'message-square',
    'Download': 'download',
    'Image': 'image',
    'GraduationCap': 'graduation-cap',
    'Wrench': 'wrench',
    'Briefcase': 'briefcase',
    'Check': 'check',
    'Dices': 'dices',
    'BrainCircuit': 'brain-circuit',
    'BarChart3': 'bar-chart-3',
    'Banknote': 'banknote',
    'Quote': 'quote',
    'Star': 'star',
    'Package': 'package',
    'Layout': 'layout',
    'Calendar': 'calendar',
    'User': 'user',
    'Share2': 'share-2',
    'ArrowLeft': 'arrow-left',
    'Youtube': 'youtube',
    'Linkedin': 'linkedin',
    'Instagram': 'instagram',
    'BookOpen': 'book-open',
    'Play': 'play',
    'ChevronDown': 'chevron-down',
    'PlayCircle': 'play-circle',
    'Zap': 'zap',
    'Rocket': 'rocket',
    'DollarSign': 'dollar-sign',
    'AlertCircle': 'alert-circle',
}

def convert_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Remover import de lucide-react
    content = re.sub(r"import\s+{[^}]+}\s+from\s+['\"]lucide-react['\"];?\n?", '', content)
    
    # Adicionar import do Icons.astro se ainda não tiver
    if 'Icons.astro' not in content and any(icon in original_content for icon in icon_mapping.keys()):
        # Determinar path relativo baseado na localização do arquivo
        rel_path = os.path.relpath(file_path, '/Users/joel/Documents/Dev/joelburigo/src')
        depth = rel_path.count(os.sep)
        
        if depth == 1:  # src/pages/
            icons_import = "import Icons from '@/components/ui/Icons.astro'\n"
        elif 'components/' in rel_path:
            if '/home/' in rel_path or '/pages/' in rel_path or '/layout/' in rel_path:
                icons_import = "import Icons from '../ui/Icons.astro'\n" if depth == 2 else "import Icons from '@/components/ui/Icons.astro'\n"
            else:  # ui/
                icons_import = "import Icons from './Icons.astro'\n"
        else:
            icons_import = "import Icons from '@/components/ui/Icons.astro'\n"
        
        # Adicionar após o último import
        last_import = list(re.finditer(r"^import\s+.+$", content, re.MULTILINE))
        if last_import:
            pos = last_import[-1].end()
            content = content[:pos] + '\n' + icons_import + content[pos:]
        else:
            # Adicionar após ---
            content = re.sub(r"(---\n)", r"\1" + icons_import, content, count=1)
    
    # Converter usos dos ícones
    for pascal, kebab in icon_mapping.items():
        # Pattern para <IconName className="..." /> ou <IconName class="..." />
        content = re.sub(
            rf'<{pascal}\s+className="([^"]*)"(\s*/?>)',
            rf'<Icons name="{kebab}" class="\1"\2',
            content
        )
        content = re.sub(
            rf'<{pascal}\s+class="([^"]*)"(\s*/?>)',
            rf'<Icons name="{kebab}" class="\1"\2',
            content
        )
        # Pattern sem className
        content = re.sub(
            rf'<{pascal}\s*/?>',
            rf'<Icons name="{kebab}" />',
            content
        )
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ Converted: {file_path}")
        return True
    return False

# Encontrar todos os arquivos .astro
src_path = Path('/Users/joel/Documents/Dev/joelburigo/src')
astro_files = list(src_path.rglob('*.astro'))

converted = 0
for file_path in astro_files:
    if convert_file(str(file_path)):
        converted += 1

print(f"\nTotal converted: {converted}/{len(astro_files)} files")
