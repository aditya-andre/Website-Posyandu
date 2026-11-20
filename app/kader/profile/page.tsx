'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import KaderShell from '@/components/kader-shell'

export default function ProfilePage() {
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true)
      if (!event.target.files || event.target.files.length === 0) return

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop() || 'jpg'
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      
      // 1. Upload ke bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // 2. Ambil Public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      
      // 3. Simpan ke User Metadata -> fotoURL
      await supabase.auth.updateUser({
        data: { photoURL: data.publicUrl }
      })

      alert('Foto profil berhasil!')
      window.location.reload()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <KaderShell title="Pengaturan Profil">
      <div className="max-w-xl space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Foto Profil</h2>
          <p className="mb-4 text-sm text-gray-500">Ganti foto yang muncul di sidebar.</p>
          
          <div className="flex items-center gap-6">
            <input 
              type="file" 
              accept="image/*" 
              onChange={uploadAvatar} 
              disabled={uploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          {uploading && <p className="mt-2 text-sm text-blue-600 animate-pulse">Mengunggah...</p>}
        </div>
      </div>
    </KaderShell>
  )
}