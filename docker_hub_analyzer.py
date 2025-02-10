#!/usr/bin/env python3
"""
Docker Hub MCP Image Analyzer
Analyzes Docker Hub images matching 'mcp' query for security, maintenance, and usage patterns.
"""

import json
import sys
from datetime import datetime, timezone
from typing import Dict, List, Optional
import urllib.parse
import urllib.request
from dataclasses import dataclass
import time

@dataclass
class DockerImage:
    name: str
    organization: str
    downloads: int
    last_updated: datetime
    description: str
    tags: List[str]
    verified: bool
    official: bool

class DockerHubAnalyzer:
    def __init__(self):
        self.images: List[DockerImage] = []
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
        }

    def search_images(self, query: str = "mcp", page: int = 1) -> Dict:
        """Search Docker Hub for images matching the query using v2 API."""
        url = f"https://hub.docker.com/v2/search/repositories/?query={query}&page={page}&page_size=25"
        print(f"Fetching: {url}")

        try:
            request = urllib.request.Request(url, headers=self.headers)
            with urllib.request.urlopen(request) as response:
                data = json.loads(response.read().decode('utf-8'))
                print(f"Found {data.get('count', 0)} total results")
                if data.get('results'):
                    print(f"Sample result structure: {json.dumps(data['results'][0], indent=2)}")
                return data
        except Exception as e:
            print(f"Error fetching page {page}: {str(e)}", file=sys.stderr)
            return {'count': 0, 'results': []}

    def analyze_images(self) -> None:
        """Analyze all MCP-related images on Docker Hub."""
        page = 1
        total_processed = 0

        while True:
            print(f"\nFetching page {page}...")
            results = self.search_images(page=page)

            if not results.get('results'):
                print("No more results found.")
                break

            for image_data in results['results']:
                try:
                    print(f"\nProcessing image: {json.dumps(image_data, indent=2)}")

                    # Extract namespace and name
                    repo_name = image_data.get('repo_name', '')
                    if not repo_name:
                        print(f"Skipping image with no repo_name")
                        continue

                    namespace, name = repo_name.split('/') if '/' in repo_name else ('', repo_name)

                    # Create DockerImage object
                    docker_image = DockerImage(
                        name=name,
                        organization=namespace,
                        downloads=image_data.get('pull_count', 0),
                        last_updated=datetime.fromisoformat(image_data.get('last_updated', datetime.now().isoformat()).replace('Z', '+00:00')),
                        description=image_data.get('description', ''),
                        tags=self._get_image_tags(namespace, name),
                        verified=image_data.get('is_verified', False),
                        official=image_data.get('is_official', False)
                    )
                    self.images.append(docker_image)
                    total_processed += 1
                    print(f"Successfully processed: {docker_image.organization}/{docker_image.name} ({docker_image.downloads:,} pulls)")

                except Exception as e:
                    print(f"Error processing image: {str(e)}", file=sys.stderr)
                    continue

            print(f"Processed page {page} ({total_processed} images so far)")

            if not results.get('next'):
                print("No more pages available.")
                break

            page += 1
            time.sleep(1)  # Rate limiting

    def _get_image_tags(self, namespace: str, repository: str) -> List[str]:
        """Fetch tags for a specific image."""
        if not namespace or not repository:
            return []

        url = f"https://hub.docker.com/v2/repositories/{namespace}/{repository}/tags"
        try:
            request = urllib.request.Request(url, headers=self.headers)
            with urllib.request.urlopen(request) as response:
                data = json.loads(response.read().decode('utf-8'))
                return [tag['name'] for tag in data.get('results', [])]
        except Exception as e:
            print(f"Error fetching tags for {namespace}/{repository}: {str(e)}", file=sys.stderr)
            return []

    def generate_report(self) -> str:
        """Generate analysis report in markdown format."""
        now = datetime.now(timezone.utc)
        active_images = [img for img in self.images
                        if (now - img.last_updated).days < 180]
        popular_images = [img for img in self.images if img.downloads > 100000]

        report = [
            "# Docker Hub MCP Image Analysis Report",
            f"\nGenerated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n",
            f"## Summary",
            f"- Total images analyzed: {len(self.images)}",
            f"- Actively maintained images: {len(active_images)}",
            f"- Popular images (>100k pulls): {len(popular_images)}",
            f"- Verified images: {len([img for img in self.images if img.verified])}",
        ]

        if popular_images:
            report.extend([
                f"\n## Popular Images",
                "(>100,000 pulls)\n"
            ])

            for img in sorted(popular_images, key=lambda x: x.downloads, reverse=True):
                report.extend([
                    f"\n### {img.organization}/{img.name}",
                    f"- Downloads: {img.downloads:,}",
                    f"- Last updated: {img.last_updated.strftime('%Y-%m-%d')}",
                    f"- Verified: {'Yes' if img.verified else 'No'}",
                    f"- Official: {'Yes' if img.official else 'No'}",
                    f"- Tags: {', '.join(img.tags[:5])}{'...' if len(img.tags) > 5 else ''}",
                    f"\n{img.description}\n"
                ])

        if active_images:
            report.extend([
                "\n## Recently Updated Images",
                "(Updated within last 180 days)\n"
            ])

            for img in sorted(active_images, key=lambda x: x.last_updated, reverse=True)[:10]:
                report.extend([
                    f"\n### {img.organization}/{img.name}",
                    f"- Last updated: {img.last_updated.strftime('%Y-%m-%d')}",
                    f"- Downloads: {img.downloads:,}",
                    f"- Verified: {'Yes' if img.verified else 'No'}",
                    f"- Tags: {', '.join(img.tags[:5])}{'...' if len(img.tags) > 5 else ''}",
                    f"\n{img.description}\n"
                ])

        report.extend([
            "\n## Security Recommendations",
            "1. Only use verified images when available",
            "2. Check last update date - avoid images not maintained within 6 months",
            "3. Verify documentation quality before using any image",
            "4. Review security scanning results when available",
            "5. Prefer official images over community versions"
        ])

        return '\n'.join(report)

def main():
    analyzer = DockerHubAnalyzer()
    print("Starting Docker Hub analysis...")
    analyzer.analyze_images()

    report = analyzer.generate_report()
    report_file = 'docker_hub_mcp_analysis.md'

    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)

    print(f"\nAnalysis complete! Report saved to {report_file}")

if __name__ == "__main__":
    main()