

import { project_data } from './data';

describe('project_data array', () => {
    test('contains at least one project', () => {
        expect(project_data.length).toBeGreaterThan(0);
    });

    test('each project has required properties', () => {
        project_data.forEach(project => {
            expect(project).toHaveProperty('id');
            expect(project).toHaveProperty('category');
            expect(project).toHaveProperty('title');
            expect(project).toHaveProperty('description');
            expect(project).toHaveProperty('languages');
            expect(project).toHaveProperty('status');
            expect(project).toHaveProperty('tags');
            expect(project).toHaveProperty('metadata');
            expect(project).toHaveProperty('externalLink');
            expect(project).toHaveProperty('date');
            expect(project).toHaveProperty('previewImage');
        });
    });

    test('previewImage property is imported correctly', () => {
        project_data.forEach(project => {
            expect(project.previewImage).toMatch(/img1.jpg$/);
        });
    });
});
