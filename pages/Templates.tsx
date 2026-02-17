import React from 'react';
import { Layout } from '../components/Layout';
import { Routes, Route } from 'react-router-dom';
import { TemplatesList } from './TemplatesList';
import { TemplateEditor } from './TemplateEditor';

export const Templates: React.FC = () => {
    return (
        <Layout>
            <Routes>
                <Route index element={<TemplatesList />} />
                <Route path="create" element={<TemplateEditor />} />
                <Route path="edit/:id" element={<TemplateEditor />} />
            </Routes>
        </Layout>
    );
};