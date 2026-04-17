-- Server-side length for profiles.role_other_detail: NULL or 8–100 chars (trimmed).

ALTER TABLE public.profiles
ADD CONSTRAINT role_other_detail_length CHECK (
    role_other_detail IS NULL
    OR (
        char_length(trim(role_other_detail)) >= 8
        AND char_length(trim(role_other_detail)) <= 100
    )
) NOT VALID;

UPDATE public.profiles
SET
    role_other_detail = NULL
WHERE
    role_other_detail IS NOT NULL
    AND (
        char_length(trim(role_other_detail)) < 8
        OR char_length(trim(role_other_detail)) > 100
    );

ALTER TABLE public.profiles VALIDATE CONSTRAINT role_other_detail_length;
