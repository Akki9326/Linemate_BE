DO $$
DECLARE
    campaigns_id INTEGER;
    cohort_id INTEGER;
    campaign_master_id INTEGER;
    cohort_master_id INTEGER;
BEGIN

SELECT id INTO campaigns_id FROM permissions WHERE name = 'Campaigns';
SELECT id INTO cohort_id FROM permissions WHERE name = 'Cohort';


INSERT INTO permissions (name, type, description, "createdBy")
VALUES 
    ('Manage Campaign', 'tenant', 'Permission for accessing Campaigns', 0),
    ('Manage Cohort', 'tenant', 'Permission for accessing Cohorts', 0);


    
SELECT id INTO campaign_master_id FROM permissions WHERE name = 'Manage Campaign';
SELECT id INTO cohort_master_id FROM permissions WHERE name = 'Manage Cohort';


update permissions set "parentId" = campaign_master_id where id = campaigns_id;
update permissions set "parentId" = cohort_master_id where id = cohort_id;

END $$;