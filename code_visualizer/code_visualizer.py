import os
import zipfile
import tarfile
import tempfile
import subprocess
import time
from PIL import Image, ImageDraw, ImageFont
import pygments
from pygments import lexers, formatters
from pygments.formatters import HtmlFormatter
import html2image
import json
from pathlib import Path
import networkx as nx
import plotly.graph_objects as go

class CodeVisualizer:
    def __init__(self, repo_path, options=None):
        self.repo_path = repo_path
        self.temp_dir = tempfile.mkdtemp()
        self.options = options or {}
        self.max_files_per_image = self.options.get('max_files', 50)
        self.padding = self.options.get('padding', 20)
        self.line_height = self.options.get('line_height', 25)
        self.image_format = self.options.get('format', 'PNG')
        self.image_quality = self.options.get('quality', 95)
        self.max_image_width = self.options.get('max_width', 1200)
        self.max_image_height = self.options.get('max_height', 1600)
        self.llm_platform = self.options.get('llm_platform', 'general')

    def extract_repo(self):
        """Extract the repository to a temporary directory"""
        if os.path.isdir(self.repo_path):
            # Clone git repository
            if os.path.exists(os.path.join(self.repo_path, '.git')):
                subprocess.run(['git', 'clone', self.repo_path, self.temp_dir])
            else:
                # Copy directory contents
                import shutil
                shutil.copytree(self.repo_path, self.temp_dir, dirs_exist_ok=True)
        elif self.repo_path.endswith('.zip'):
            with zipfile.ZipFile(self.repo_path, 'r') as zip_ref:
                zip_ref.extractall(self.temp_dir)
        elif self.repo_path.endswith(('.tar.gz', '.tgz')):
            with tarfile.open(self.repo_path, 'r:gz') as tar_ref:
                tar_ref.extractall(self.temp_dir)

    def get_file_structure(self):
        """Get the file structure as a dictionary"""
        structure = {}
        for root, dirs, files in os.walk(self.temp_dir):
            current = structure
            path = root.replace(self.temp_dir, '').strip(os.sep)
            if path:
                for part in path.split(os.sep):
                    current = current.setdefault(part, {})
            for file in files:
                current[file] = None
        return structure

    def create_tree_image(self, structure, output_path):
        """Create a tree-like visualization of the code structure with metadata"""
        # Calculate image dimensions
        total_items = self._count_items(structure)
        height = total_items * self.line_height + 2 * self.padding
        width = 1400  # Increased width for metadata

        # Create image with custom background based on LLM platform
        bg_color = {
            'gpt4v': (252, 252, 252),  # Light background for GPT-4V
            'claude': (255, 255, 255),  # Pure white for Claude
            'general': (248, 249, 250)  # Slightly off-white default
        }.get(self.llm_platform, (255, 255, 255))

        img = Image.new('RGB', (min(width, self.max_image_width),
                              min(height, self.max_image_height)),
                              color=bg_color)
        draw = ImageDraw.Draw(img)

        # Draw the tree
        try:
            font = ImageFont.truetype("arial.ttf", 14)
            title_font = ImageFont.truetype("arial.ttf", 16)
        except Exception:
            font = ImageFont.load_default()
            title_font = font

        # Draw title and legend
        draw.text((10, 10), "Repository Structure Analysis", fill='black', font=title_font)
        draw.text((10, 35), "File Types:", fill='black', font=font)

        # Color coding for different file types
        file_types = {
            'Source': (0, 120, 212),    # Blue for source code
            'Config': (16, 124, 16),     # Green for config files
            'Doc': (128, 0, 128),        # Purple for documentation
            'Test': (200, 0, 0),         # Red for test files
            'Other': (128, 128, 128)     # Gray for other files
        }

        # Draw legend
        legend_y = 55
        for file_type, color in file_types.items():
            draw.rectangle([(10, legend_y), (30, legend_y + 15)], fill=color)
            draw.text((35, legend_y), file_type, fill='black', font=font)
            legend_y += 25

        y = legend_y + 20
        self._draw_enhanced_structure(draw, structure, 0, y, font, file_types)

        # Save image with proper format
        img.save(output_path, format=self.image_format)

    def _draw_enhanced_structure(self, draw, structure, level, y, font, file_types):
        """Recursively draw the structure with enhanced metadata"""
        x = self.padding + level * 30

        if isinstance(structure, dict):
            for key, value in structure.items():
                # Determine file type and color
                color = file_types['Other']
                if key.endswith(('.py', '.js', '.ts', '.jsx', '.tsx')):
                    color = file_types['Source']
                elif key.endswith(('.json', '.yaml', '.yml', '.env', '.gitignore')):
                    color = file_types['Config']
                elif key.endswith(('.md', '.txt', '.rst')):
                    color = file_types['Doc']
                elif 'test' in key.lower():
                    color = file_types['Test']

                # Draw colored indicator
                draw.rectangle([(x-15, y+2), (x-5, y+12)], fill=color)

                # Draw filename
                draw.text((x, y), key, fill='black', font=font)

                # Add file metadata if it's a file
                if value is None and os.path.exists(os.path.join(self.temp_dir, key)):
                    file_path = os.path.join(self.temp_dir, key)
                    size = os.path.getsize(file_path)
                    mtime = os.path.getmtime(file_path)

                    # Format size and modification time
                    size_str = f"{size/1024:.1f}KB"
                    mtime_str = time.strftime("%Y-%m-%d", time.localtime(mtime))

                    # Draw metadata
                    metadata = f"Size: {size_str} | Modified: {mtime_str}"
                    draw.text((x + 300, y), metadata, fill=(100, 100, 100), font=font)

                y += self.line_height
                if value is not None:
                    y = self._draw_enhanced_structure(draw, value, level + 1, y, font, file_types)

        return y

    def create_code_preview(self, output_path):
        """Create a syntax-highlighted preview of code files with pagination"""
        html_content = []

        for root, _, files in os.walk(self.temp_dir):
            for file in files:
                if file.endswith(('.py', '.js', '.ts', '.jsx', '.tsx', '.html', '.css')):
                    file_path = os.path.join(root, file)
                    with open(file_path, 'r', encoding='utf-8') as f:
                        try:
                            content = f.read()
                            lexer = lexers.get_lexer_for_filename(file)
                            formatter = HtmlFormatter(style='monokai')
                            highlighted = pygments.highlight(content, lexer, formatter)
                            # Add file name and metadata
                            html_content.append(f"<h3>{file}</h3><p>File Size: {os.path.getsize(file_path) / 1024:.1f} KB | Last Modified: {time.strftime('%Y-%m-%d', time.localtime(os.path.getmtime(file_path)))}</p>{highlighted}")
                        except Exception:
                            continue

        if html_content:
            full_html = f"""
            <html>
                <head>
                    <style>
                        {HtmlFormatter().get_style_defs('.highlight')}
                        body {{ background: white; padding: 20px; }}
                        h3 {{ color: #333; }}
                    </style>
                </head>
                <body>{''.join(html_content)}</body>
            </html>
            """

            # Html2Image needs to work from the output directory
            output_dir = os.path.dirname(output_path)
            filename = os.path.basename(output_path)

            # Create output directory if it doesn't exist
            os.makedirs(output_dir, exist_ok=True)

            # Change to output directory temporarily
            current_dir = os.getcwd()
            os.chdir(output_dir)

            try:
                hti = html2image.Html2Image(size=(self.max_image_width, self.max_image_height))
                hti.screenshot(html_str=full_html, save_as=filename)
            finally:
                # Change back to original directory
                os.chdir(current_dir)

    def _count_items(self, structure):
        """Count total items in the structure"""
        count = 1
        if isinstance(structure, dict):
            for value in structure.values():
                if value is not None:
                    count += self._count_items(value)
        return count

    def cleanup(self):
        """Clean up temporary files"""
        import shutil
        if os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir)

    def create_dependency_graph(self, output_path):
        """Create an enhanced visualization of code dependencies"""
        G = nx.DiGraph()
        node_types = {}
        edge_weights = {}

        # Analyze imports and dependencies
        for root, _, files in os.walk(self.temp_dir):
            for file in files:
                if file.endswith(('.py', '.js', '.ts')):
                    file_path = os.path.join(root, file)
                    with open(file_path, 'r', encoding='utf-8') as f:
                        try:
                            content = f.read()
                            rel_path = os.path.relpath(file_path, self.temp_dir)

                            # Determine node type
                            if 'test' in rel_path.lower():
                                node_types[rel_path] = 'test'
                            elif any(kw in content.lower() for kw in ['api', 'router', 'endpoint']):
                                node_types[rel_path] = 'api'
                            elif any(kw in content.lower() for kw in ['database', 'model', 'schema']):
                                node_types[rel_path] = 'data'
                            elif any(kw in content.lower() for kw in ['component', 'view', 'template']):
                                node_types[rel_path] = 'ui'
                            else:
                                node_types[rel_path] = 'other'

                            G.add_node(rel_path)

                            # Enhanced import detection
                            if file.endswith('.py'):
                                imports = [line.strip() for line in content.split('\n')
                                         if line.strip().startswith(('import ', 'from '))]
                            else:  # JavaScript/TypeScript
                                imports = [line.strip() for line in content.split('\n')
                                         if line.strip().startswith(('import ', 'require('))]

                            # Count import frequency for edge weights
                            for imp in imports:
                                edge = (rel_path, imp)
                                edge_weights[edge] = edge_weights.get(edge, 0) + 1
                                G.add_edge(*edge)
                        except Exception:
                            continue

        # Removed Matplotlib code for graph visualization

def convert_repo_to_images(repo_path, output_dir="output", options=None):
    """Convert a repository zip file to various visual formats"""
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    visualizer = CodeVisualizer(repo_path, options)

    try:
        # Extract repository
        visualizer.extract_repo()

        # Create visualizations
        visualizer.create_tree_image(
            visualizer.get_file_structure(),
            os.path.join(output_dir, f"repo_structure_{options.get('format', 'png').lower()}_{time.strftime('%Y%m%d_%H%M%S')}.png")
        )

        visualizer.create_code_preview(
            os.path.join(output_dir, f"code_preview_{options.get('format', 'png').lower()}_{time.strftime('%Y%m%d_%H%M%S')}.png")
        )

        visualizer.create_dependency_graph(
            os.path.join(output_dir, f"dependency_graph_{options.get('format', 'png').lower()}_{time.strftime('%Y%m%d_%H%M%S')}.png")
        )

    finally:
        visualizer.cleanup()

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Convert code repository to images')
    parser.add_argument('repo_path', help='Path to repository (directory, .zip, or .tar.gz)')
    parser.add_argument('--output', default='output', help='Output directory')
    parser.add_argument('--format', default='PNG', choices=['PNG', 'JPEG'],
                       help='Output image format')
    parser.add_argument('--quality', type=int, default=95,
                       help='Image quality (1-100, JPEG only)')
    parser.add_argument('--max-width', type=int, default=1200,
                       help='Maximum image width')
    parser.add_argument('--max-height', type=int, default=1600,
                       help='Maximum image height')
    parser.add_argument('--llm-platform', default='general',
                       choices=['general', 'gpt4v', 'claude'],
                       help='Target LLM platform for optimization')

    args = parser.parse_args()

    options = {
        'format': args.format,
        'quality': args.quality,
        'max_width': args.max_width,
        'max_height': args.max_height,
        'llm_platform': args.llm_platform
    }

    convert_repo_to_images(args.repo_path, args.output, options)
