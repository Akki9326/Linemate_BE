-- Step 1: Insert the top-level permissions and get their IDs
INSERT INTO permissions (name, type, description, "createdBy")
VALUES 
    ('Core Platform', 'tenant', 'Permission for accessing Core Platform', 0),
    ('Content Creation', 'tenant', 'Permission for accessing Content Creation', 0),
    ('Campaigns', 'tenant', 'Permission for accessing Campaigns', 0),
    ('Cohort', 'tenant', 'Permission for accessing Cohorts', 0),
    ('Dashboards', 'tenant', 'Permission for accessing Dashboards', 0);

-- Retrieve the IDs of the top-level permissions
DO $$ 
DECLARE
    core_platform_id INTEGER;
    content_creation_id INTEGER;
    campaigns_id INTEGER;
    cohort_id INTEGER;
    dashboards_id INTEGER;
    employee_list_id INTEGER;
    user_variables_id INTEGER;
    permission_groups_id INTEGER;
    users_settings_id INTEGER;
    company_id INTEGER;
    communications_id INTEGER;
    company_details_id INTEGER;
    aliasing_id INTEGER;
    vernacularization_id INTEGER;
    create_flashcards_id INTEGER;
    create_documents_id INTEGER;
    create_videos_id INTEGER;
    campaign_dashboards_id INTEGER;
    content_dashboard_id INTEGER;
BEGIN
    -- Select IDs for top-level permissions
    SELECT id INTO core_platform_id FROM permissions WHERE name = 'Core Platform';
    SELECT id INTO content_creation_id FROM permissions WHERE name = 'Content Creation';
    SELECT id INTO campaigns_id FROM permissions WHERE name = 'Campaigns';
    SELECT id INTO cohort_id FROM permissions WHERE name = 'Cohort';
    SELECT id INTO dashboards_id FROM permissions WHERE name = 'Dashboards';

    -- Step 2: Insert child permissions under "Core Platform"
    INSERT INTO permissions (name, type, "parentId", description, "createdBy")
    VALUES 
        ('Employee List', 'tenant', core_platform_id, 'Permission for managing employee list', 0),
        ('User Variables', 'tenant', core_platform_id, 'Permission for managing user variables', 0),
        ('Permission Groups', 'tenant', core_platform_id, 'Permission for managing permission groups', 0),
        ('Users Settings', 'tenant', core_platform_id, 'Permission for managing user settings', 0),
        ('Company', 'tenant', core_platform_id, 'Permission for managing company', 0),
        ('Communications', 'tenant', core_platform_id, 'Permission for managing communications', 0),
        ('Company Details', 'tenant', core_platform_id, 'Permission for managing company details', 0),
        ('Aliasing', 'tenant', core_platform_id, 'Permission for managing aliasing', 0),
        ('Vernacularization', 'tenant', core_platform_id, 'Permission for managing vernacularization', 0);

    -- Retrieve the IDs for child permissions under "Core Platform"
    SELECT id INTO employee_list_id FROM permissions WHERE name = 'Employee List';
    SELECT id INTO user_variables_id FROM permissions WHERE name = 'User Variables';
    SELECT id INTO permission_groups_id FROM permissions WHERE name = 'Permission Groups';
    SELECT id INTO users_settings_id FROM permissions WHERE name = 'Users Settings';
    SELECT id INTO company_id FROM permissions WHERE name = 'Company';
    SELECT id INTO communications_id FROM permissions WHERE name = 'Communications';
    SELECT id INTO company_details_id FROM permissions WHERE name = 'Company Details';
    SELECT id INTO aliasing_id FROM permissions WHERE name = 'Aliasing';
    SELECT id INTO vernacularization_id FROM permissions WHERE name = 'Vernacularization';

    -- Step 3: Insert sub-permissions under each child of "Core Platform"
    INSERT INTO permissions (name, type, "parentId", description, "createdBy")
    VALUES 
        ('employee.view', 'tenant', employee_list_id, 'Permission to view employee list', 0),
        ('employee.edit', 'tenant', employee_list_id, 'Permission to edit employee list', 0),
        ('variables.view', 'tenant', user_variables_id, 'Permission to view user variables', 0),
        ('variables.edit', 'tenant', user_variables_id, 'Permission to edit user variables', 0),
        ('permissionGroup.view', 'tenant', permission_groups_id, 'Permission to view permission groups', 0),
        ('permissionGroup.edit', 'tenant', permission_groups_id, 'Permission to edit permission groups', 0),
        ('usersSettings.view', 'tenant', users_settings_id, 'Permission to view user settings', 0),
        ('usersSettings.edit', 'tenant', users_settings_id, 'Permission to edit user settings', 0),
        ('company.view', 'tenant', company_id, 'Permission to view company details', 0),
        ('company.edit', 'tenant', company_id, 'Permission to edit company details', 0),
        ('communications.view', 'tenant', communications_id, 'Permission to view communications', 0),
        ('communications.edit', 'tenant', communications_id, 'Permission to edit communications', 0),
        ('companyDetails.view', 'tenant', company_details_id, 'Permission to view company details', 0),
        ('companyDetails.edit', 'tenant', company_details_id, 'Permission to edit company details', 0),
        ('Aliasing.view', 'tenant', aliasing_id, 'Permission to view aliasing', 0),
        ('Aliasing.edit', 'tenant', aliasing_id, 'Permission to edit aliasing', 0),
        ('vernacularization.view', 'tenant', vernacularization_id, 'Permission to view vernacularization', 0),
        ('vernacularization.edit', 'tenant', vernacularization_id, 'Permission to edit vernacularization', 0);

    -- Step 4: Insert child permissions under "Content Creation"
    INSERT INTO permissions (name, type, "parentId", description, "createdBy")
    VALUES 
        ('Create Flashcards', 'tenant', content_creation_id, 'Permission for creating flashcards', 0),
        ('Create Documents', 'tenant', content_creation_id, 'Permission for creating documents', 0),
        ('Create Videos', 'tenant', content_creation_id, 'Permission for creating videos', 0);

    -- Retrieve the IDs for child permissions under "Content Creation"
    SELECT id INTO create_flashcards_id FROM permissions WHERE name = 'Create Flashcards';
    SELECT id INTO create_documents_id FROM permissions WHERE name = 'Create Documents';
    SELECT id INTO create_videos_id FROM permissions WHERE name = 'Create Videos';

    -- Step 5: Insert sub-permissions under each child of "Content Creation"
    INSERT INTO permissions (name, type, "parentId", description, "createdBy")
    VALUES 
        ('createFlashcards.view', 'tenant', create_flashcards_id, 'Permission to view flashcards', 0),
        ('createFlashcards.edit', 'tenant', create_flashcards_id, 'Permission to edit flashcards', 0),
        ('createDocuments.view', 'tenant', create_documents_id, 'Permission to view documents', 0),
        ('createDocuments.edit', 'tenant', create_documents_id, 'Permission to edit documents', 0),
        ('createVideos.view', 'tenant', create_videos_id, 'Permission to view videos', 0),
        ('createVideos.edit', 'tenant', create_videos_id, 'Permission to edit videos', 0);

    -- Step 6: Insert child permissions under "Campaigns"
    INSERT INTO permissions (name, type, "parentId", description, "createdBy")
    VALUES 
        ('campaigns.view', 'tenant', campaigns_id, 'Permission to view camping', 0),
        ('campaigns.edit', 'tenant', campaigns_id, 'Permission to edit camping', 0);

    INSERT INTO permissions (name, type, "parentId", description, "createdBy")
    VALUES 
        ('cohort.view', 'tenant', cohort_id, 'Permission to view cohorts', 0),
        ('cohort.edit', 'tenant', cohort_id, 'Permission to edit cohorts', 0);

    -- Step 7: Insert child permissions under "Dashboards"
    INSERT INTO permissions (name, type, "parentId", description, "createdBy")
    VALUES 
        ('Campaign Dashboard', 'tenant', dashboards_id, 'Permission for accessing Campaign Dashboard', 0),
        ('Content Dashboard', 'tenant', dashboards_id, 'Permission for accessing Content Dashboard', 0);

    -- Retrieve the IDs for child permissions under "Dashboards"
    SELECT id INTO campaign_dashboards_id FROM permissions WHERE name = 'Campaign Dashboard';
    SELECT id INTO content_dashboard_id FROM permissions WHERE name = 'Content Dashboard';

    -- Step 8: Insert sub-permissions under each child of "Dashboards"
    INSERT INTO permissions (name, type, "parentId", description, "createdBy")
    VALUES 
        ('campaign.view', 'tenant', campaign_dashboards_id, 'Permission to view campaigns in the dashboard', 0),
        ('campaign.edit', 'tenant', campaign_dashboards_id, 'Permission to edit campaigns in the dashboard', 0),
        ('content.view', 'tenant', content_dashboard_id, 'Permission to view content in the dashboard', 0),
        ('content.edit', 'tenant', content_dashboard_id, 'Permission to edit content in the dashboard', 0);
END $$;
