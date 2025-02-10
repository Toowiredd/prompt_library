import sys
import os
from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout,
                            QHBoxLayout, QPushButton, QLabel, QFileDialog,
                            QProgressBar, QComboBox)
from PyQt6.QtCore import Qt, QMimeData
from PyQt6.QtGui import QDragEnterEvent, QDropEvent
from code_visualizer import CodeVisualizer

class DropArea(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setAcceptDrops(True)
        self.setMinimumSize(400, 200)

        # Setup layout
        layout = QVBoxLayout(self)
        self.label = QLabel("Drag and drop repository folder/zip here\nor click to select")
        self.label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(self.label)

        # Styling
        self.setStyleSheet("""
            DropArea {
                border: 2px dashed #aaa;
                border-radius: 5px;
                background-color: #f8f9fa;
            }
            DropArea:hover {
                border-color: #2196f3;
                background-color: #e3f2fd;
            }
        """)

    def dragEnterEvent(self, event: QDragEnterEvent):
        if event.mimeData().hasUrls():
            event.acceptProposedAction()
            self.setStyleSheet("""
                DropArea {
                    border: 2px dashed #2196f3;
                    border-radius: 5px;
                    background-color: #e3f2fd;
                }
            """)

    def dragLeaveEvent(self, event):
        self.setStyleSheet("""
            DropArea {
                border: 2px dashed #aaa;
                border-radius: 5px;
                background-color: #f8f9fa;
            }
            DropArea:hover {
                border-color: #2196f3;
                background-color: #e3f2fd;
            }
        """)

    def dropEvent(self, event: QDropEvent):
        self.setStyleSheet("""
            DropArea {
                border: 2px dashed #aaa;
                border-radius: 5px;
                background-color: #f8f9fa;
            }
            DropArea:hover {
                border-color: #2196f3;
                background-color: #e3f2fd;
            }
        """)

        urls = event.mimeData().urls()
        if urls:
            path = urls[0].toLocalFile()
            # Find the MainWindow parent
            parent = self
            while parent and not isinstance(parent, MainWindow):
                parent = parent.parent()
            if parent:
                parent.process_repository(path)

    def mousePressEvent(self, event):
        file_path = QFileDialog.getExistingDirectory(self, "Select Repository Folder")
        if file_path:
            # Find the MainWindow parent
            parent = self
            while parent and not isinstance(parent, MainWindow):
                parent = parent.parent()
            if parent:
                parent.process_repository(file_path)

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Code Visualizer")
        self.setMinimumSize(800, 600)

        # Create central widget and layout
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        layout = QVBoxLayout(central_widget)

        # Create top section with options
        options_layout = QHBoxLayout()

        # LLM Platform selector
        self.platform_selector = QComboBox()
        self.platform_selector.addItems(['general', 'gpt4v', 'claude'])
        options_layout.addWidget(QLabel("LLM Platform:"))
        options_layout.addWidget(self.platform_selector)

        # Image format selector
        self.format_selector = QComboBox()
        self.format_selector.addItems(['PNG', 'JPEG'])
        options_layout.addWidget(QLabel("Image Format:"))
        options_layout.addWidget(self.format_selector)

        options_layout.addStretch()
        layout.addLayout(options_layout)

        # Create drop area
        self.drop_area = DropArea(self)
        layout.addWidget(self.drop_area)

        # Progress bar
        self.progress = QProgressBar()
        self.progress.setVisible(False)
        layout.addWidget(self.progress)

        # Output directory selector
        output_layout = QHBoxLayout()
        self.output_label = QLabel("Output Directory: Not Selected")
        output_button = QPushButton("Select Output Directory")
        output_button.clicked.connect(self.select_output_directory)
        output_layout.addWidget(self.output_label)
        output_layout.addWidget(output_button)
        layout.addLayout(output_layout)

        # Status label
        self.status_label = QLabel("")
        layout.addWidget(self.status_label)

        self.output_dir = "output"  # Default output directory

    def select_output_directory(self):
        dir_path = QFileDialog.getExistingDirectory(self, "Select Output Directory")
        if dir_path:
            self.output_dir = dir_path
            self.output_label.setText(f"Output Directory: {dir_path}")

    def process_repository(self, repo_path):
        self.progress.setVisible(True)
        self.progress.setRange(0, 0)  # Indeterminate progress
        self.status_label.setText("Processing repository...")

        try:
            options = {
                'format': self.format_selector.currentText(),
                'quality': 95,
                'max_width': 1200,
                'max_height': 1600,
                'llm_platform': self.platform_selector.currentText()
            }

            # Create output directory if it doesn't exist
            os.makedirs(self.output_dir, exist_ok=True)

            # Initialize visualizer
            visualizer = CodeVisualizer(repo_path, options)

            # Extract repository
            visualizer.extract_repo()

            # Create visualizations
            structure = visualizer.get_file_structure()
            # Create visualizations with proper format handling
            img_format = options['format'].lower()
            visualizer.create_tree_image(
                structure,
                os.path.join(self.output_dir, f"repo_structure.{img_format}")
            )

            visualizer.create_code_preview(
                os.path.join(self.output_dir, f"code_preview.{img_format}")
            )

            visualizer.create_dependency_graph(
                os.path.join(self.output_dir, f"dependency_graph.{img_format}")
            )

            # Cleanup
            visualizer.cleanup()

            self.status_label.setText(
                f"Processing complete! Output saved to: {self.output_dir}"
            )
            self.progress.setRange(0, 100)
            self.progress.setValue(100)

        except Exception as e:
            self.status_label.setText(f"Error: {str(e)}")
            self.progress.setRange(0, 100)
            self.progress.setValue(0)

def main():
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())

if __name__ == '__main__':
    main()
