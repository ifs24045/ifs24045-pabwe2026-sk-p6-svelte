<script>
  import { FileQuestion, House } from "lucide-svelte";
  import { navigate } from "../../../router.js";
</script>

<div class="min-h-screen flex flex-col items-center justify-center px-4 text-center">
  <div class="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
    <FileQuestion size={32} />
  </div>
  <p data-testid="not-found-code" class="text-6xl font-extrabold text-slate-900 tracking-tight">404</p>
  <h1 class="mt-2 text-xl font-bold text-slate-800">Halaman Tidak Ditemukan</h1>
  <p class="mt-1 text-sm text-slate-600 max-w-sm">
    Halaman yang Anda cari tidak ada atau sudah dipindahkan.
  </p>
  <button
    type="button"
    data-testid="not-found-home-btn"
    on:click={() => navigate("/")}
    class="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/25 transition-all"
  >
    <House size={16} />
    Kembali ke Beranda
  </button>
</div>