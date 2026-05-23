<template>
  <NotFound v-if="adminAccessDenied" />
  <div v-else-if="adminGateReady" class="page-wrapper admin-page">
    <Header />
    <main class="admin-main">
      <h1>Administración</h1>
      <p class="admin-subtitle">
        Catálogo, pedidos y gestión de registros.
      </p>

      <div class="admin-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          :class="['admin-tab', { active: tab === 'pedidos' }]"
          @click="tab = 'pedidos'"
        >
          Pedidos
        </button>
        <button
          type="button"
          role="tab"
          :class="['admin-tab', { active: tab === 'juegos' }]"
          @click="tab = 'juegos'"
        >
          Videojuegos
        </button>
        <button
          type="button"
          role="tab"
          :class="['admin-tab', { active: tab === 'consolas' }]"
          @click="tab = 'consolas'"
        >
          Consolas
        </button>
        <button
          type="button"
          role="tab"
          :class="['admin-tab', { active: tab === 'merch' }]"
          @click="tab = 'merch'"
        >
          Merchandising
        </button>
      </div>

      <!-- Pedidos -->
      <section v-show="tab === 'pedidos'" class="admin-panel" aria-label="Pedidos">
        <h2>Pedidos</h2>
        <div class="admin-toolbar">
          <div class="admin-field">
            <label for="pf-filtro">Buscar por</label>
            <select id="pf-filtro" v-model="pedidoFilterMode">
              <option value="id">ID pedido</option>
              <option value="cliente">Cliente (nombre / email)</option>
            </select>
          </div>
          <div class="admin-field admin-toolbar-grow">
            <label for="pf-q">Término</label>
            <input
              id="pf-q"
              v-model="pedidoSearchInput"
              :placeholder="pedidoFilterMode === 'id' ? 'Ej: 12' : 'Ej: ana@ o Ana'"
              autocomplete="off"
              @keyup.enter="cargarPedidos"
            />
          </div>
          <button type="button" class="admin-btn-primary" @click="cargarPedidos">Buscar</button>
          <button type="button" class="admin-btn-secondary" @click="limpiarPedidos">Ver todos</button>
        </div>

        <p v-if="loading.pedidos" class="admin-loading">Cargando pedidos…</p>
        <p v-else-if="!pedidosLista.length" class="admin-empty">No hay pedidos que mostrar.</p>
        <ul v-else class="admin-list">
          <li v-for="p in pedidosLista" :key="p.id" class="admin-list-item">
            <div class="admin-list-meta">
              <strong>
                <span class="admin-id-badge">#{{ p.id }}</span>
                {{ formatEuro(p.total) }} €
              </strong>
              <span>
                {{ formatFecha(p.fecha_pedido) }} ·
                <span class="admin-estado-pill">{{ p.estado }}</span>
              </span>
              <span v-if="p.usuario">
                {{ p.usuario.nombre }} {{ p.usuario.apellido1 }} · {{ p.usuario.email }}
              </span>
              <span v-else>Sin usuario</span>
            </div>
            <div class="admin-row-actions">
              <button type="button" class="admin-btn-secondary" @click="abrirPedido(p.id)">
                Ver / editar
              </button>
            </div>
          </li>
        </ul>
      </section>

      <!-- Toolbar productos (solo pestañas catálogo) -->
      <template v-if="tab === 'juegos' || tab === 'consolas' || tab === 'merch'">
        <div class="admin-panel admin-toolbar-panel">
          <h2 class="sr-only">Filtro de productos</h2>
          <div class="admin-toolbar">
            <div class="admin-field">
              <label for="prod-filtro">Filtrar lista por</label>
              <select id="prod-filtro" v-model="productFilterMode">
                <option value="nombre">Nombre</option>
                <option value="id">ID producto</option>
              </select>
            </div>
            <div class="admin-field admin-toolbar-grow">
              <label for="prod-q">Texto</label>
              <input
                id="prod-q"
                v-model="productSearchQuery"
                :placeholder="productFilterMode === 'id' ? 'ID exacto' : 'Contiene…'"
                autocomplete="off"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- Juegos -->
      <section v-show="tab === 'juegos'" class="admin-panel" aria-label="Videojuegos">
        <div class="admin-section-head">
          <h2>Videojuegos</h2>
          <button type="button" class="admin-btn-secondary" @click="showFormJuego = !showFormJuego">
            {{ showFormJuego ? 'Cancelar' : 'Añadir' }}
          </button>
        </div>
        <div v-show="showFormJuego">
          <div class="admin-form-grid">
          <div class="admin-field">
            <label for="aj-nombre">Nombre</label>
            <input id="aj-nombre" v-model="formJuego.nombre" autocomplete="off" />
          </div>
          <div class="admin-field">
            <label for="aj-precio">Precio (€)</label>
            <input id="aj-precio" v-model.number="formJuego.precio" type="number" min="0" step="0.01" />
          </div>
          <div class="admin-field">
            <label for="aj-genero">Género</label>
            <input id="aj-genero" v-model="formJuego.genero" autocomplete="off" />
          </div>
          <div class="admin-field">
            <label for="aj-edad">Edad mínima</label>
            <input id="aj-edad" v-model.number="formJuego.edad_minima" type="number" min="0" max="18" />
          </div>
          <div class="admin-field admin-field-full">
            <span class="admin-label-block">Plataformas y stock</span>
            <div class="admin-plat-rows">
              <div
                v-for="(row, idx) in formJuego.plataformas"
                :key="idx"
                class="admin-plat-row"
              >
                <select v-model.number="row.plataforma_id" :aria-label="`Plataforma ${idx + 1}`">
                  <option :value="0">Selecciona…</option>
                  <option
                    v-for="p in plataformasDisponiblesPorFila(formJuego.plataformas, idx)"
                    :key="p.id"
                    :value="p.id"
                  >
                    {{ p.nombre }}
                  </option>
                </select>
                <input
                  v-model.number="row.control_stock"
                  type="number"
                  min="0"
                  :aria-label="`Stock plataforma ${idx + 1}`"
                />
                <button
                  type="button"
                  class="admin-btn-secondary admin-plat-remove"
                  :disabled="formJuego.plataformas.length <= 1"
                  @click="removeFormJuegoPlat(idx)"
                >
                  Quitar
                </button>
              </div>
              <button type="button" class="admin-btn-secondary" @click="addFormJuegoPlat">
                + Añadir plataforma
              </button>
            </div>
          </div>
          <div class="admin-field admin-field-full">
            <label for="aj-img">URL imagen (opcional)</label>
            <input id="aj-img" v-model="formJuego.imagen_url" type="url" placeholder="https://…" />
          </div>
          <div class="admin-field admin-field-full">
            <label for="aj-desc">Descripción</label>
            <textarea id="aj-desc" v-model="formJuego.descripcion" />
          </div>
        </div>
        <button type="button" class="admin-btn-primary" :disabled="saving" @click="submitJuego">
          Confirmar
        </button>
        </div>

        <p v-if="loading.juegos" class="admin-loading">Cargando lista…</p>
        <p v-else-if="!juegosFiltrados.length" class="admin-empty">No hay videojuegos (con este filtro).</p>
        <ul v-else class="admin-list">
          <li v-for="item in juegosFiltrados" :key="item.id" class="admin-list-item">
            <div class="admin-list-meta">
              <strong>
                <span class="admin-id-badge">ID {{ item.id }}</span>
                {{ item.nombre }}
              </strong>
              <span>{{ item.precio }} € · {{ item.juego?.genero || '—' }}</span>
              <span v-if="resumenPlataformasJuego(item)" class="admin-plat-summary">{{
                resumenPlataformasJuego(item)
              }}</span>
              <span v-if="resumenStockJuego(item)" class="admin-stock-summary"
                >Stock: {{ resumenStockJuego(item) }}</span
              >
            </div>
            <div class="admin-row-actions">
              <button type="button" class="admin-btn-secondary" @click="abrirEditarJuego(item)">
                Editar
              </button>
              <button type="button" class="admin-btn-danger" @click="eliminar(item.id)">Eliminar</button>
            </div>
          </li>
        </ul>
      </section>

      <!-- Consolas -->
      <section v-show="tab === 'consolas'" class="admin-panel" aria-label="Consolas">
        <div class="admin-section-head">
          <h2>Consolas</h2>
          <button type="button" class="admin-btn-secondary" @click="showFormConsola = !showFormConsola">
            {{ showFormConsola ? 'Cancelar' : 'Añadir' }}
          </button>
        </div>
        <div v-show="showFormConsola">
        <div class="admin-form-grid">
          <div class="admin-field">
            <label for="ac-nombre">Nombre</label>
            <input id="ac-nombre" v-model="formConsola.nombre" autocomplete="off" />
          </div>
          <div class="admin-field">
            <label for="ac-precio">Precio (€)</label>
            <input id="ac-precio" v-model.number="formConsola.precio" type="number" min="0" step="0.01" />
          </div>
          <div class="admin-field">
            <label for="ac-cap">Capacidad</label>
            <input id="ac-cap" v-model="formConsola.capacidad_almacenamiento" autocomplete="off" />
          </div>
          <div class="admin-field">
            <label for="ac-color">Color</label>
            <input id="ac-color" v-model="formConsola.color" autocomplete="off" />
          </div>
          <div class="admin-field">
            <label for="ac-fab">Fabricante</label>
            <input id="ac-fab" v-model="formConsola.fabricante" autocomplete="off" />
          </div>
          <div class="admin-field">
            <label for="ac-plat">Plataforma</label>
            <select id="ac-plat" v-model.number="formConsola.plataforma_id">
              <option disabled :value="0">Selecciona…</option>
              <option v-for="p in plataformas" :key="p.id" :value="p.id">{{ p.nombre }}</option>
            </select>
          </div>
          <div class="admin-field">
            <label for="ac-stock">Stock</label>
            <input id="ac-stock" v-model.number="formConsola.control_stock" type="number" min="0" />
          </div>
          <div class="admin-field admin-field-full">
            <label for="ac-img">URL imagen (opcional)</label>
            <input id="ac-img" v-model="formConsola.imagen_url" type="url" />
          </div>
          <div class="admin-field admin-field-full">
            <label for="ac-desc">Descripción</label>
            <textarea id="ac-desc" v-model="formConsola.descripcion" />
          </div>
        </div>
        <button type="button" class="admin-btn-primary" :disabled="saving" @click="submitConsola">
          Confirmar
        </button>
        </div>

        <p v-if="loading.consolas" class="admin-loading">Cargando lista…</p>
        <p v-else-if="!consolasFiltradas.length" class="admin-empty">No hay consolas (con este filtro).</p>
        <ul v-else class="admin-list">
          <li v-for="item in consolasFiltradas" :key="item.id" class="admin-list-item">
            <div class="admin-list-meta">
              <strong>
                <span class="admin-id-badge">ID {{ item.id }}</span>
                {{ item.nombre }}
              </strong>
              <span>{{ item.precio }} € · Stock: {{ item.consola?.control_stock ?? 0 }} · {{ item.consola?.fabricante || '—' }}</span>
            </div>
            <div class="admin-row-actions">
              <button type="button" class="admin-btn-secondary" @click="abrirEditarConsola(item)">
                Editar
              </button>
              <button type="button" class="admin-btn-danger" @click="eliminar(item.id)">Eliminar</button>
            </div>
          </li>
        </ul>
      </section>

      <!-- Merch -->
      <section v-show="tab === 'merch'" class="admin-panel" aria-label="Merchandising">
        <div class="admin-section-head">
          <h2>Merchandising</h2>
          <button type="button" class="admin-btn-secondary" @click="showFormMerch = !showFormMerch">
            {{ showFormMerch ? 'Cancelar' : 'Añadir' }}
          </button>
        </div>
        <div v-show="showFormMerch">
        <div class="admin-form-grid">
          <div class="admin-field">
            <label for="am-nombre">Nombre</label>
            <input id="am-nombre" v-model="formMerch.nombre" autocomplete="off" />
          </div>
          <div class="admin-field">
            <label for="am-precio">Precio (€)</label>
            <input id="am-precio" v-model.number="formMerch.precio" type="number" min="0" step="0.01" />
          </div>
          <div class="admin-field">
            <label for="am-cat">Categoría</label>
            <input id="am-cat" v-model="formMerch.categoria" autocomplete="off" />
          </div>
          <div class="admin-field">
            <label for="am-stock">Stock</label>
            <input id="am-stock" v-model.number="formMerch.control_stock" type="number" min="0" />
          </div>
          <div class="admin-field admin-field-full">
            <label for="am-img">URL imagen (opcional)</label>
            <input id="am-img" v-model="formMerch.imagen_url" type="url" />
          </div>
          <div class="admin-field admin-field-full">
            <label for="am-desc">Descripción</label>
            <textarea id="am-desc" v-model="formMerch.descripcion" />
          </div>
        </div>
        <button type="button" class="admin-btn-primary" :disabled="saving" @click="submitMerch">
          Confirmar
        </button>
        </div>

        <p v-if="loading.merch" class="admin-loading">Cargando lista…</p>
        <p v-else-if="!merchFiltrado.length" class="admin-empty">No hay merchandising (con este filtro).</p>
        <ul v-else class="admin-list">
          <li v-for="item in merchFiltrado" :key="item.id" class="admin-list-item">
            <div class="admin-list-meta">
              <strong>
                <span class="admin-id-badge">ID {{ item.id }}</span>
                {{ item.nombre }}
              </strong>
              <span>{{ item.precio }} € · Stock: {{ item.merchandising?.control_stock ?? 0 }} · {{ item.merchandising?.categoria || '—' }}</span>
            </div>
            <div class="admin-row-actions">
              <button type="button" class="admin-btn-secondary" @click="abrirEditarMerch(item)">
                Editar
              </button>
              <button type="button" class="admin-btn-danger" @click="eliminar(item.id)">Eliminar</button>
            </div>
          </li>
        </ul>
      </section>
    </main>
    <Footer />

    <!-- Modal editar juego -->
    <div
      v-if="editJuegoOpen"
      class="admin-modal-overlay"
      role="dialog"
      aria-modal="true"
      @click.self="editJuegoOpen = false"
    >
      <div class="admin-modal">
        <h3>Editar videojuego #{{ editJuego.id }}</h3>
        <div class="admin-form-grid">
          <div class="admin-field admin-field-full">
            <label>Nombre</label>
            <input v-model="editJuego.nombre" autocomplete="off" />
          </div>
          <div class="admin-field">
            <label>Precio (€)</label>
            <input v-model.number="editJuego.precio" type="number" min="0" step="0.01" />
          </div>
          <div class="admin-field">
            <label>Género</label>
            <input v-model="editJuego.genero" autocomplete="off" />
          </div>
          <div class="admin-field">
            <label>Edad mínima</label>
            <input v-model.number="editJuego.edad_minima" type="number" min="0" max="18" />
          </div>
          <div class="admin-field admin-field-full">
            <span class="admin-label-block">Plataformas y stock</span>
            <div class="admin-plat-rows">
              <div
                v-for="(row, idx) in editJuego.plataformas"
                :key="'ej-' + idx"
                class="admin-plat-row"
              >
                <select v-model.number="row.plataforma_id" :aria-label="`Editar plataforma ${idx + 1}`">
                  <option :value="0">Selecciona…</option>
                  <option
                    v-for="p in plataformasDisponiblesPorFila(editJuego.plataformas, idx)"
                    :key="p.id"
                    :value="p.id"
                  >
                    {{ p.nombre }}
                  </option>
                </select>
                <input
                  v-model.number="row.control_stock"
                  type="number"
                  min="0"
                  :aria-label="`Stock plataforma ${idx + 1}`"
                />
                <button
                  type="button"
                  class="admin-btn-secondary admin-plat-remove"
                  :disabled="editJuego.plataformas.length <= 1"
                  @click="removeEditJuegoPlat(idx)"
                >
                  Quitar
                </button>
              </div>
              <button type="button" class="admin-btn-secondary" @click="addEditJuegoPlat">
                + Añadir plataforma
              </button>
            </div>
          </div>
          <div class="admin-field admin-field-full">
            <label>URL imagen</label>
            <input v-model="editJuego.imagen_url" type="url" />
          </div>
          <div class="admin-field admin-field-full">
            <label>Descripción</label>
            <textarea v-model="editJuego.descripcion" />
          </div>
        </div>
        <div class="admin-modal-actions">
          <button type="button" class="admin-btn-primary" :disabled="savingEdit" @click="guardarEdicionJuego">
            Guardar
          </button>
          <button type="button" class="admin-btn-secondary" @click="editJuegoOpen = false">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Modal editar consola -->
    <div
      v-if="editConsolaOpen"
      class="admin-modal-overlay"
      role="dialog"
      aria-modal="true"
      @click.self="editConsolaOpen = false"
    >
      <div class="admin-modal">
        <h3>Editar consola #{{ editConsola.id }}</h3>
        <div class="admin-form-grid">
          <div class="admin-field admin-field-full">
            <label>Nombre</label>
            <input v-model="editConsola.nombre" autocomplete="off" />
          </div>
          <div class="admin-field">
            <label>Precio (€)</label>
            <input v-model.number="editConsola.precio" type="number" min="0" step="0.01" />
          </div>
          <div class="admin-field">
            <label>Capacidad</label>
            <input v-model="editConsola.capacidad_almacenamiento" autocomplete="off" />
          </div>
          <div class="admin-field">
            <label>Color</label>
            <input v-model="editConsola.color" autocomplete="off" />
          </div>
          <div class="admin-field">
            <label>Fabricante</label>
            <input v-model="editConsola.fabricante" autocomplete="off" />
          </div>
          <div class="admin-field">
            <label>Plataforma</label>
            <select v-model.number="editConsola.plataforma_id">
              <option v-for="p in plataformas" :key="p.id" :value="p.id">{{ p.nombre }}</option>
            </select>
          </div>
          <div class="admin-field">
            <label>Stock</label>
            <input v-model.number="editConsola.control_stock" type="number" min="0" />
          </div>
          <div class="admin-field admin-field-full">
            <label>URL imagen</label>
            <input v-model="editConsola.imagen_url" type="url" />
          </div>
          <div class="admin-field admin-field-full">
            <label>Descripción</label>
            <textarea v-model="editConsola.descripcion" />
          </div>
        </div>
        <div class="admin-modal-actions">
          <button type="button" class="admin-btn-primary" :disabled="savingEdit" @click="guardarEdicionConsola">
            Guardar
          </button>
          <button type="button" class="admin-btn-secondary" @click="editConsolaOpen = false">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Modal editar merchandising -->
    <div
      v-if="editMerchOpen"
      class="admin-modal-overlay"
      role="dialog"
      aria-modal="true"
      @click.self="editMerchOpen = false"
    >
      <div class="admin-modal">
        <h3>Editar merchandising #{{ editMerch.id }}</h3>
        <div class="admin-form-grid">
          <div class="admin-field admin-field-full">
            <label>Nombre</label>
            <input v-model="editMerch.nombre" autocomplete="off" />
          </div>
          <div class="admin-field">
            <label>Precio (€)</label>
            <input v-model.number="editMerch.precio" type="number" min="0" step="0.01" />
          </div>
          <div class="admin-field">
            <label>Categoría</label>
            <input v-model="editMerch.categoria" autocomplete="off" />
          </div>
          <div class="admin-field">
            <label>Stock</label>
            <input v-model.number="editMerch.control_stock" type="number" min="0" />
          </div>
          <div class="admin-field admin-field-full">
            <label>URL imagen</label>
            <input v-model="editMerch.imagen_url" type="url" />
          </div>
          <div class="admin-field admin-field-full">
            <label>Descripción</label>
            <textarea v-model="editMerch.descripcion" />
          </div>
        </div>
        <div class="admin-modal-actions">
          <button type="button" class="admin-btn-primary" :disabled="savingEdit" @click="guardarEdicionMerch">
            Guardar
          </button>
          <button type="button" class="admin-btn-secondary" @click="editMerchOpen = false">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Modal pedido -->
    <div
      v-if="pedidoModalOpen"
      class="admin-modal-overlay"
      role="dialog"
      aria-modal="true"
      @click.self="pedidoModalOpen = false"
    >
      <div class="admin-modal admin-modal-wide">
        <h3>Pedido #{{ pedidoVista?.id }}</h3>
        <p v-if="pedidoModalLoading" class="admin-loading">Cargando…</p>
        <template v-else-if="pedidoVista">
          <p class="admin-hint" style="margin-top: 0">
            {{ formatFecha(pedidoVista.fecha_pedido) }} · Total {{ formatEuro(pedidoVista.total) }} €
          </p>
          <div class="admin-form-grid">
            <div class="admin-field">
              <label>Estado</label>
              <select v-model="pedidoForm.estado">
                <option v-for="e in ESTADOS_PEDIDO" :key="e" :value="e">{{ e }}</option>
              </select>
            </div>
            <div class="admin-field">
              <label>Teléfono contacto</label>
              <input v-model="pedidoForm.telefono_contacto" autocomplete="off" />
            </div>
          </div>
          <p class="admin-hint" style="margin-bottom: 8px">Dirección de envío</p>
          <div class="admin-form-grid">
            <div class="admin-field admin-field-full">
              <label>Calle</label>
              <input v-model="pedidoForm.calle" autocomplete="off" />
            </div>
            <div class="admin-field">
              <label>Número</label>
              <input v-model="pedidoForm.numero_casa" autocomplete="off" />
            </div>
            <div class="admin-field">
              <label>Ciudad</label>
              <input v-model="pedidoForm.ciudad" autocomplete="off" />
            </div>
            <div class="admin-field">
              <label>Código postal</label>
              <input v-model="pedidoForm.codigo_postal" autocomplete="off" />
            </div>
            <div class="admin-field">
              <label>Región</label>
              <input v-model="pedidoForm.region" autocomplete="off" placeholder="ej. peninsula" />
            </div>
          </div>
          <div v-if="pedidoVista.usuario" class="admin-hint">
            Cliente: {{ pedidoVista.usuario.nombre }} {{ pedidoVista.usuario.apellido1 }} ({{
              pedidoVista.usuario.email
            }})
          </div>
          <div class="admin-field admin-field-full" style="margin-top: 12px">
            <label for="pedido-notas">Notas internas</label>
            <textarea id="pedido-notas" v-model="pedidoForm.notas" rows="5" placeholder="Opcional" />
          </div>
          <ul class="admin-pedido-lineas">
            <li v-for="d in pedidoVista.detalles || []" :key="d.id">
              <strong>#{{ d.producto?.id }}</strong> {{ d.producto?.nombre }} × {{ d.cantidad }} @
              {{ formatEuro(d.precio_unitario) }} €
              <template v-if="d.plataforma">({{ d.plataforma.nombre }})</template>
            </li>
          </ul>
          <div class="admin-modal-actions">
            <button type="button" class="admin-btn-primary" :disabled="savingPedido" @click="guardarPedido">
              Guardar cambios
            </button>
            <button type="button" class="admin-btn-secondary" @click="pedidoModalOpen = false">
              Cerrar
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import Header from '../../components/Header/Header.vue'
import Footer from '../../components/Footer/Footer.vue'
import NotFound from '../NotFound/NotFound.vue'
import { toast } from '../../stores/toastStore'
import {
  createAdminConsola,
  createAdminJuego,
  createAdminMerchandising,
  deleteAdminProducto,
  fetchAdminPedido,
  fetchAdminPedidos,
  patchAdminPedido,
  fetchIsAdmin,
  updateAdminConsola,
  updateAdminJuego,
  updateAdminMerchandising,
} from '../../api/useAdmin'

const apiUrl = import.meta.env.VITE_BACK_CONNECTION

const adminAccessDenied = ref(false)
const adminGateReady = ref(false)

const ESTADOS_PEDIDO = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado']

const tab = ref('pedidos')
const saving = ref(false)
const savingEdit = ref(false)
const savingPedido = ref(false)
const plataformas = ref([])

const productFilterMode = ref('nombre')
const productSearchQuery = ref('')

const pedidoFilterMode = ref('id')
const pedidoSearchInput = ref('')
const pedidosLista = ref([])

const showFormJuego = ref(false)
const showFormConsola = ref(false)
const showFormMerch = ref(false)

const loading = reactive({
  juegos: false,
  consolas: false,
  merch: false,
  pedidos: false,
})

const listas = reactive({
  juegos: [],
  consolas: [],
  merch: [],
})

const formJuego = reactive({
  nombre: '',
  precio: 0,
  descripcion: '',
  imagen_url: '',
  genero: '',
  edad_minima: 0,
  plataformas: [{ plataforma_id: 0, control_stock: 0 }],
})

const formConsola = reactive({
  nombre: '',
  precio: 0,
  descripcion: '',
  imagen_url: '',
  capacidad_almacenamiento: '',
  color: '',
  fabricante: '',
  plataforma_id: 0,
  control_stock: 0,
})

const formMerch = reactive({
  nombre: '',
  precio: 0,
  descripcion: '',
  imagen_url: '',
  categoria: '',
  control_stock: 0,
})

const editJuegoOpen = ref(false)
const editConsolaOpen = ref(false)
const editMerchOpen = ref(false)

const editJuego = reactive({
  id: null,
  nombre: '',
  precio: 0,
  descripcion: '',
  imagen_url: '',
  genero: '',
  edad_minima: 0,
  plataformas: [{ plataforma_id: 0, control_stock: 0 }],
})

const editConsola = reactive({
  id: null,
  nombre: '',
  precio: 0,
  descripcion: '',
  imagen_url: '',
  capacidad_almacenamiento: '',
  color: '',
  fabricante: '',
  plataforma_id: 0,
  control_stock: 0,
})

const editMerch = reactive({
  id: null,
  nombre: '',
  precio: 0,
  descripcion: '',
  imagen_url: '',
  categoria: '',
  control_stock: 0,
})

const pedidoModalOpen = ref(false)
const pedidoModalLoading = ref(false)
const pedidoVista = ref(null)
const pedidoForm = reactive({
  estado: 'pendiente',
  telefono_contacto: '',
  calle: '',
  numero_casa: '',
  ciudad: '',
  codigo_postal: '',
  region: 'peninsula',
  notas: '',
})

function filtroProducto(item) {
  const q = productSearchQuery.value.trim()
  if (!q) return true
  if (productFilterMode.value === 'id') {
    const n = parseInt(q, 10)
    return !Number.isNaN(n) && item.id === n
  }
  return String(item.nombre || '')
    .toLowerCase()
    .includes(q.toLowerCase())
}

const juegosFiltrados = computed(() => listas.juegos.filter(filtroProducto))
const consolasFiltradas = computed(() => listas.consolas.filter(filtroProducto))
const merchFiltrado = computed(() => listas.merch.filter(filtroProducto))

function pivotJuegoStock(plataforma) {
  if (!plataforma) return 0
  const jp = plataforma.JuegoPlataforma || plataforma.juegos_plataformas
  return jp != null ? Number(jp.control_stock) || 0 : 0
}

function resumenPlataformasJuego(item) {
  const plats = item.juego?.plataformas || []
  if (!plats.length) return ''
  return plats.map((p) => p.nombre).join(' · ')
}

/** Stock por plataforma para listado admin (juegos). */
function resumenStockJuego(item) {
  const plats = item.juego?.plataformas || []
  if (!plats.length) return ''
  return plats.map((p) => `${p.nombre}: ${pivotJuegoStock(p)}`).join(' · ')
}

function addFormJuegoPlat() {
  formJuego.plataformas.push({ plataforma_id: 0, control_stock: 0 })
}

function removeFormJuegoPlat(idx) {
  if (formJuego.plataformas.length <= 1) return
  formJuego.plataformas.splice(idx, 1)
}

function addEditJuegoPlat() {
  editJuego.plataformas.push({
    plataforma_id: plataformas.value[0]?.id ?? 0,
    control_stock: 0,
  })
}

function removeEditJuegoPlat(idx) {
  if (editJuego.plataformas.length <= 1) return
  editJuego.plataformas.splice(idx, 1)
}

function buildPlataformasPayload(rows) {
  const plataformas = rows
    .filter((r) => r.plataforma_id > 0)
    .map((r) => ({
      plataforma_id: r.plataforma_id,
      control_stock: Math.max(0, Math.floor(Number(r.control_stock) || 0)),
    }))
  const ids = new Set(plataformas.map((r) => r.plataforma_id))
  if (ids.size !== plataformas.length) {
    return { error: 'No repitas la misma plataforma' }
  }
  if (plataformas.length === 0) {
    return { error: 'Indica al menos una plataforma' }
  }
  return { plataformas }
}

function plataformasDisponiblesPorFila(rows, rowIndex) {
  const list = plataformas.value
  if (!list?.length) return []
  const currentId = rows[rowIndex]?.plataforma_id
  const usadasOtras = new Set()
  rows.forEach((r, i) => {
    if (i !== rowIndex && r.plataforma_id > 0) {
      usadasOtras.add(r.plataforma_id)
    }
  })
  return list.filter((p) => !usadasOtras.has(p.id) || p.id === currentId)
}

function formatEuro(val) {
  if (val == null || val === '') return '0.00'
  const n = typeof val === 'string' ? parseFloat(val) : Number(val)
  return Number.isFinite(n) ? n.toFixed(2) : '0.00'
}

function formatFecha(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleString('es-ES')
}

async function cargarPlataformas() {
  try {
    const res = await fetch(`${apiUrl}/plataformas`)
    const data = await res.json()
    plataformas.value = data.plataformas || []
  } catch {
    plataformas.value = []
    toast.error('No se pudieron cargar las plataformas')
  }
}

async function cargarJuegos() {
  loading.juegos = true
  try {
    const res = await fetch(`${apiUrl}/videojuegos`)
    const data = await res.json()
    listas.juegos = data.videojuegos || []
  } catch {
    listas.juegos = []
    toast.error('No se pudo cargar la lista de juegos')
  } finally {
    loading.juegos = false
  }
}

async function cargarConsolas() {
  loading.consolas = true
  try {
    const res = await fetch(`${apiUrl}/consolas`)
    const data = await res.json()
    listas.consolas = data.consolas || []
  } catch {
    listas.consolas = []
    toast.error('No se pudo cargar la lista de consolas')
  } finally {
    loading.consolas = false
  }
}

async function cargarMerch() {
  loading.merch = true
  try {
    const res = await fetch(`${apiUrl}/merchandising`)
    const data = await res.json()
    listas.merch = data.merchandising || []
  } catch {
    listas.merch = []
    toast.error('No se pudo cargar la lista de merchandising')
  } finally {
    loading.merch = false
  }
}

async function cargarPedidos() {
  loading.pedidos = true
  try {
    const data = await fetchAdminPedidos({
      q: pedidoSearchInput.value,
      filtro: pedidoFilterMode.value,
    })
    pedidosLista.value = data.pedidos || []
  } catch (e) {
    toast.error(e.message || 'Error al cargar pedidos')
    pedidosLista.value = []
  } finally {
    loading.pedidos = false
  }
}

function limpiarPedidos() {
  pedidoSearchInput.value = ''
  cargarPedidos()
}

async function verifyAdminAccess() {
  try {
    const { isAdmin } = await fetchIsAdmin()
    if (!isAdmin) {
      adminAccessDenied.value = true
      return false
    }
    return true
  } catch {
    adminAccessDenied.value = true
    return false
  }
}

watch(
  tab,
  async (t) => {
    if (adminAccessDenied.value) return
    const ok = await verifyAdminAccess()
    if (!ok) return
    adminGateReady.value = true

    showFormJuego.value = false
    showFormConsola.value = false
    showFormMerch.value = false
    if (t === 'pedidos') cargarPedidos()
    else if (t === 'juegos') cargarJuegos()
    else if (t === 'consolas') cargarConsolas()
    else cargarMerch()
  },
  { immediate: true },
)

cargarPlataformas()

function abrirEditarJuego(item) {
  const plats = item.juego?.plataformas || []
  editJuego.id = item.id
  editJuego.nombre = item.nombre
  editJuego.precio = Number(item.precio)
  editJuego.descripcion = item.descripcion || ''
  editJuego.imagen_url = item.imagen_url || ''
  editJuego.genero = item.juego?.genero || ''
  editJuego.edad_minima = item.juego?.edad_minima ?? 0
  editJuego.plataformas =
    plats.length > 0
      ? plats.map((plat) => ({
          plataforma_id: plat.id,
          control_stock: pivotJuegoStock(plat),
        }))
      : [{ plataforma_id: plataformas.value[0]?.id ?? 0, control_stock: 0 }]
  editJuegoOpen.value = true
}

async function guardarEdicionJuego() {
  if (!editJuego.nombre.trim() || !editJuego.genero.trim()) {
    toast.error('Nombre y género obligatorios')
    return
  }
  const platPayload = buildPlataformasPayload(editJuego.plataformas)
  if (platPayload.error) {
    toast.error(platPayload.error)
    return
  }
  savingEdit.value = true
  try {
    await updateAdminJuego(editJuego.id, {
      nombre: editJuego.nombre.trim(),
      precio: editJuego.precio,
      descripcion: editJuego.descripcion || null,
      imagen_url: editJuego.imagen_url || null,
      genero: editJuego.genero.trim(),
      edad_minima: editJuego.edad_minima,
      plataformas: platPayload.plataformas,
    })
    toast.success('Videojuego actualizado')
    editJuegoOpen.value = false
    await cargarJuegos()
  } catch (e) {
    toast.error(e.message || 'Error al guardar')
  } finally {
    savingEdit.value = false
  }
}

function abrirEditarConsola(item) {
  const c = item.consola
  editConsola.id = item.id
  editConsola.nombre = item.nombre
  editConsola.precio = Number(item.precio)
  editConsola.descripcion = item.descripcion || ''
  editConsola.imagen_url = item.imagen_url || ''
  editConsola.capacidad_almacenamiento = c?.capacidad_almacenamiento || ''
  editConsola.color = c?.color || ''
  editConsola.fabricante = c?.fabricante || ''
  editConsola.plataforma_id = c?.plataforma_id ?? plataformas.value[0]?.id ?? 0
  editConsola.control_stock = c?.control_stock ?? 0
  editConsolaOpen.value = true
}

async function guardarEdicionConsola() {
  if (!editConsola.nombre.trim() || !editConsola.fabricante.trim()) {
    toast.error('Nombre y fabricante obligatorios')
    return
  }
  if (!editConsola.plataforma_id) {
    toast.error('Selecciona plataforma')
    return
  }
  savingEdit.value = true
  try {
    await updateAdminConsola(editConsola.id, {
      nombre: editConsola.nombre.trim(),
      precio: editConsola.precio,
      descripcion: editConsola.descripcion || null,
      imagen_url: editConsola.imagen_url || null,
      capacidad_almacenamiento: editConsola.capacidad_almacenamiento.trim(),
      color: editConsola.color || null,
      fabricante: editConsola.fabricante.trim(),
      plataforma_id: editConsola.plataforma_id,
      control_stock: editConsola.control_stock,
    })
    toast.success('Consola actualizada')
    editConsolaOpen.value = false
    await cargarConsolas()
  } catch (e) {
    toast.error(e.message || 'Error al guardar')
  } finally {
    savingEdit.value = false
  }
}

function abrirEditarMerch(item) {
  const m = item.merchandising
  editMerch.id = item.id
  editMerch.nombre = item.nombre
  editMerch.precio = Number(item.precio)
  editMerch.descripcion = item.descripcion || ''
  editMerch.imagen_url = item.imagen_url || ''
  editMerch.categoria = m?.categoria || ''
  editMerch.control_stock = m?.control_stock ?? 0
  editMerchOpen.value = true
}

async function guardarEdicionMerch() {
  if (!editMerch.nombre.trim() || !editMerch.categoria.trim()) {
    toast.error('Nombre y categoría obligatorios')
    return
  }
  savingEdit.value = true
  try {
    await updateAdminMerchandising(editMerch.id, {
      nombre: editMerch.nombre.trim(),
      precio: editMerch.precio,
      descripcion: editMerch.descripcion || null,
      imagen_url: editMerch.imagen_url || null,
      categoria: editMerch.categoria.trim(),
      control_stock: editMerch.control_stock,
    })
    toast.success('Merchandising actualizado')
    editMerchOpen.value = false
    await cargarMerch()
  } catch (e) {
    toast.error(e.message || 'Error al guardar')
  } finally {
    savingEdit.value = false
  }
}

async function abrirPedido(id) {
  pedidoModalOpen.value = true
  pedidoModalLoading.value = true
  pedidoVista.value = null
  try {
    const data = await fetchAdminPedido(id)
    pedidoVista.value = data.pedido
    pedidoForm.estado = data.pedido.estado
    pedidoForm.telefono_contacto = data.pedido.telefono_contacto || ''
    const dir = data.pedido.direccion
    pedidoForm.calle = dir?.calle || ''
    pedidoForm.numero_casa = dir?.numero_casa || ''
    pedidoForm.ciudad = dir?.ciudad || ''
    pedidoForm.codigo_postal = dir?.codigo_postal || ''
    pedidoForm.region = dir?.region || 'peninsula'
    pedidoForm.notas = data.pedido.notas ?? ''
  } catch (e) {
    toast.error(e.message || 'No se pudo cargar el pedido')
    pedidoModalOpen.value = false
  } finally {
    pedidoModalLoading.value = false
  }
}

async function guardarPedido() {
  if (!pedidoVista.value?.id) return
  savingPedido.value = true
  try {
    const body = {
      estado: pedidoForm.estado,
      telefono_contacto: pedidoForm.telefono_contacto,
      notas: pedidoForm.notas,
      direccion: {
        calle: pedidoForm.calle,
        numero_casa: pedidoForm.numero_casa,
        ciudad: pedidoForm.ciudad,
        codigo_postal: pedidoForm.codigo_postal,
        region: pedidoForm.region,
      },
    }
    await patchAdminPedido(pedidoVista.value.id, body)
    toast.success('Pedido actualizado')
    pedidoModalOpen.value = false
    await cargarPedidos()
  } catch (e) {
    toast.error(e.message || 'Error al guardar pedido')
  } finally {
    savingPedido.value = false
  }
}

async function submitJuego() {
  if (!formJuego.nombre.trim()) {
    toast.error('El nombre es obligatorio')
    return
  }
  if (!formJuego.genero.trim()) {
    toast.error('El género es obligatorio')
    return
  }
  const platPayload = buildPlataformasPayload(formJuego.plataformas)
  if (platPayload.error) {
    toast.error(platPayload.error)
    return
  }
  saving.value = true
  try {
    await createAdminJuego({
      nombre: formJuego.nombre.trim(),
      precio: formJuego.precio,
      descripcion: formJuego.descripcion || null,
      imagen_url: formJuego.imagen_url || null,
      genero: formJuego.genero.trim(),
      edad_minima: formJuego.edad_minima,
      plataformas: platPayload.plataformas,
    })
    toast.success('Videojuego creado')
    formJuego.nombre = ''
    formJuego.precio = 0
    formJuego.descripcion = ''
    formJuego.imagen_url = ''
    formJuego.genero = ''
    formJuego.edad_minima = 0
    formJuego.plataformas = [{ plataforma_id: 0, control_stock: 0 }]
    await cargarJuegos()
    showFormJuego.value = false
  } catch (e) {
    toast.error(e.message || 'Error al crear')
  } finally {
    saving.value = false
  }
}

async function submitConsola() {
  if (!formConsola.nombre.trim()) {
    toast.error('El nombre es obligatorio')
    return
  }
  if (!formConsola.fabricante.trim()) {
    toast.error('El fabricante es obligatorio')
    return
  }
  if (!formConsola.capacidad_almacenamiento.trim()) {
    toast.error('La capacidad es obligatoria')
    return
  }
  if (!formConsola.plataforma_id) {
    toast.error('Selecciona una plataforma')
    return
  }
  saving.value = true
  try {
    await createAdminConsola({
      nombre: formConsola.nombre.trim(),
      precio: formConsola.precio,
      descripcion: formConsola.descripcion || null,
      imagen_url: formConsola.imagen_url || null,
      capacidad_almacenamiento: formConsola.capacidad_almacenamiento.trim(),
      color: formConsola.color || null,
      fabricante: formConsola.fabricante.trim(),
      plataforma_id: formConsola.plataforma_id,
      control_stock: formConsola.control_stock,
    })
    toast.success('Consola creada')
    formConsola.nombre = ''
    formConsola.precio = 0
    formConsola.descripcion = ''
    formConsola.imagen_url = ''
    formConsola.capacidad_almacenamiento = ''
    formConsola.color = ''
    formConsola.fabricante = ''
    formConsola.plataforma_id = 0
    formConsola.control_stock = 0
    await cargarConsolas()
    showFormConsola.value = false
  } catch (e) {
    toast.error(e.message || 'Error al crear')
  } finally {
    saving.value = false
  }
}

async function submitMerch() {
  if (!formMerch.nombre.trim()) {
    toast.error('El nombre es obligatorio')
    return
  }
  if (!formMerch.categoria.trim()) {
    toast.error('La categoría es obligatoria')
    return
  }
  saving.value = true
  try {
    await createAdminMerchandising({
      nombre: formMerch.nombre.trim(),
      precio: formMerch.precio,
      descripcion: formMerch.descripcion || null,
      imagen_url: formMerch.imagen_url || null,
      categoria: formMerch.categoria.trim(),
      control_stock: formMerch.control_stock,
    })
    toast.success('Merchandising creado')
    formMerch.nombre = ''
    formMerch.precio = 0
    formMerch.descripcion = ''
    formMerch.imagen_url = ''
    formMerch.categoria = ''
    formMerch.control_stock = 0
    await cargarMerch()
    showFormMerch.value = false
  } catch (e) {
    toast.error(e.message || 'Error al crear')
  } finally {
    saving.value = false
  }
}

async function eliminar(id) {
  if (!window.confirm('¿Eliminar este producto? Se borrarán también datos relacionados.')) return
  try {
    await deleteAdminProducto(id)
    toast.success('Producto eliminado')
    if (tab.value === 'juegos') await cargarJuegos()
    else if (tab.value === 'consolas') await cargarConsolas()
    else await cargarMerch()
  } catch (e) {
    toast.error(e.message || 'No se pudo eliminar')
  }
}
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.admin-toolbar-panel {
  margin-bottom: 16px;
}

.admin-section-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.admin-section-head h2 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
}

.admin-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-image:
      linear-gradient(rgba(34, 33, 33, 0.562), rgba(34, 33, 33, 0.562)),
      url("../../assets/images/backgroundProductos.jpg");
    background-repeat: repeat-x round;
    background-size: 400px 400px;
    min-height: 100vh;
    overflow-x: hidden;
}

.admin-main {
  flex: 1;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 16px 48px;
  color: #ecf0f1;
}

.admin-main h1 {
  margin: 0 0 8px;
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
}

.admin-subtitle {
  margin: 0 0 24px;
  color: rgba(236, 240, 241, 0.75);
  font-size: 0.95rem;
}

.admin-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
}

.admin-tab {
  padding: 10px 18px;
  border-radius: 999px;
  border: 2px solid rgba(127, 48, 188, 0.45);
  background: rgba(44, 62, 80, 0.5);
  color: #ecf0f1;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.9rem;
  transition: background 0.2s, border-color 0.2s;
}

.admin-tab:hover {
  border-color: #7f30bc;
  background: rgba(127, 48, 188, 0.25);
}

.admin-tab.active {
  background: #7f30bc;
  border-color: #7f30bc;
}

.admin-panel {
  background: rgba(91, 109, 245, 0.606);
  border-radius: 14px;
  padding: 20px;
  border: 1px solid rgba(10, 32, 103, 0.771);
}

.admin-panel h2 {
  margin: 0 0 16px;
  font-size: 1.15rem;
  color: #fff;
}

.admin-form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.admin-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.admin-field label {
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(236, 240, 241, 0.85);
}

.admin-field input,
.admin-field select,
.admin-field textarea {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(26, 21, 40, 0.85);
  color: #ecf0f1;
  font-family: inherit;
  font-size: 0.9rem;
}

.admin-field textarea {
  grid-column: 1 / -1;
  min-height: 72px;
  resize: vertical;
}

.admin-field-full {
  grid-column: 1 / -1;
}

.admin-label-block {
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(236, 240, 241, 0.85);
  margin-bottom: 6px;
}

.admin-plat-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.admin-plat-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.admin-plat-row select,
.admin-plat-row input[type='number'] {
  flex: 1;
  min-width: 140px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(26, 21, 40, 0.85);
  color: #ecf0f1;
  font-family: inherit;
  font-size: 0.9rem;
}

.admin-plat-remove {
  flex-shrink: 0;
}

.admin-plat-summary {
  font-size: 0.8rem;
  color: rgba(236, 240, 241, 0.55);
}

.admin-stock-summary {
  font-size: 0.8rem;
  color: rgba(180, 255, 210, 0.85);
}

.admin-btn-primary {
  padding: 10px 22px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #7f30bc, #642f99);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.95rem;
  transition: opacity 0.2s;
}

.admin-btn-primary:hover:not(:disabled) {
  opacity: 0.92;
}

.admin-btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.admin-btn-danger {
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background: rgba(231, 76, 60, 0.85);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.82rem;
  font-family: inherit;
  flex-shrink: 0;
}

.admin-btn-danger:hover {
  background: #e74c3c;
}

.admin-list {
  list-style: none;
  margin: 24px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.admin-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  background: rgba(26, 21, 40, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.admin-list-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.admin-list-meta strong {
  color: #fff;
  font-size: 0.95rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-list-meta span {
  font-size: 0.82rem;
  color: rgba(236, 240, 241, 0.65);
}

.admin-loading,
.admin-empty {
  margin-top: 16px;
  color: rgba(236, 240, 241, 0.7);
  font-size: 0.95rem;
}

.admin-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 16px;
}

.admin-toolbar .admin-field {
  min-width: 140px;
  flex: 0 1 auto;
}

.admin-toolbar-grow {
  flex: 1;
  min-width: 180px;
}

.admin-id-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(127, 48, 188, 0.35);
  color: #e8d4ff;
  margin-right: 8px;
  vertical-align: middle;
}

.admin-row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.admin-btn-secondary {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: #ecf0f1;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.82rem;
  font-family: inherit;
}

.admin-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.14);
}

.admin-hint {
  font-size: 0.78rem;
  color: rgba(236, 240, 241, 0.55);
  margin: 0 0 12px;
  line-height: 1.35;
}

.admin-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 24px 16px;
  z-index: 2000;
  overflow-y: auto;
}

.admin-modal {
  width: 100%;
  max-width: 520px;
  background: #2c3e50;
  border-radius: 14px;
  padding: 22px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 48px;
}

.admin-modal-wide {
  max-width: 640px;
}

.admin-modal h3 {
  margin: 0 0 16px;
  font-size: 1.2rem;
  color: #fff;
}

.admin-modal-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.admin-pedido-lineas {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
  font-size: 0.88rem;
  color: rgba(236, 240, 241, 0.85);
}

.admin-pedido-lineas li {
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.admin-estado-pill {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: capitalize;
  background: rgba(52, 152, 219, 0.25);
  color: #85c1e9;
}

</style>
