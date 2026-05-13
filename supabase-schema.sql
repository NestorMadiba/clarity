-- ============================================================
-- CLARITY — Supabase SQL Setup
-- Ejecutá esto en el SQL Editor de tu proyecto Supabase
-- Dashboard → SQL Editor → New Query → Pegá esto → Run
-- ============================================================

-- 1. TABLA DE PERFILES DE USUARIO
create table if not exists public.profiles (
  id              uuid references auth.users on delete cascade primary key,
  full_name       text,
  email           text,
  phone           text,
  has_paid        boolean default false,
  is_admin        boolean default false,
  paid_at         timestamptz,
  mp_payment_id   text,
  created_at      timestamptz default now()
);

-- Habilitar Row Level Security
alter table public.profiles enable row level security;

-- Políticas: usuarios solo pueden ver/editar su propio perfil
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Admins pueden ver todos los perfiles
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );


-- 2. TABLA DE CONTENIDO PREMIUM
create table if not exists public.content_items (
  id          uuid default gen_random_uuid() primary key,
  title       text not null,
  description text,
  file_url    text,
  file_name   text,
  is_premium  boolean default true,
  created_at  timestamptz default now()
);

alter table public.content_items enable row level security;

-- Usuarios con pago pueden ver el contenido premium
create policy "Paid users can view premium content"
  on public.content_items for select
  using (
    is_premium = false
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and has_paid = true
    )
  );

-- Solo admins pueden insertar/actualizar contenido
create policy "Admins can manage content"
  on public.content_items for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );


-- 3. STORAGE BUCKET para archivos PDF
-- Ejecutá esto también:
insert into storage.buckets (id, name, public)
values ('clarity-content', 'clarity-content', true)
on conflict do nothing;

-- Política de storage: admins pueden subir, usuarios con pago pueden descargar
create policy "Admins can upload content"
  on storage.objects for insert
  with check (
    bucket_id = 'clarity-content'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Paid users can download content"
  on storage.objects for select
  using (
    bucket_id = 'clarity-content'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and has_paid = true
    )
  );


-- 4. TRIGGER para crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- Para hacer a alguien administrador, ejecutá:
-- update public.profiles set is_admin = true where email = 'tu@email.com';
-- ============================================================
