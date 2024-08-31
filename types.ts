export interface Workflow {
    id: string;
    name: string;
    description: string;
    views: number;
    tags: string[];
    content: string;
    price?: number;
    icon_url: string;
    test_url: string;
    downloads: number;
    updated_at: string;
    content_image_url: string;
  }

export interface FeaturedWorkflow {
    workflow_id: string;
    workflows: Workflow;
  }