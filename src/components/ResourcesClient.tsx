'use client';

import { Dictionary } from '@/lib/i18n/getDictionary';
import { RegisteredResource } from '@/lib/access-control/permissions';
import { ResourcesTable } from '@/components/ResourcesTable';

export interface ResourcesClientProps {
  dictionary: Dictionary;
  initialResources: RegisteredResource[];
}

export function ResourcesClient({ dictionary, initialResources }: ResourcesClientProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {dictionary.resources.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{dictionary.resources.resourceList}</p>
        </div>
      </div>

      <ResourcesTable
        resources={initialResources}
        dictionary={dictionary}
      />
    </div>
  );
}
