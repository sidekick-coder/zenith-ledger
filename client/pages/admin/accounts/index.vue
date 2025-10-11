<script setup lang="ts">
import { watch, ref } from 'vue'
import { toast } from 'vue-sonner'
import type { ComponentExposed } from 'vue-component-type-helpers'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'
import { $t } from '#shared/lang.ts'
import AppLayout from '#client/layouts/AppLayout.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import AlertButton from '#client/components/AlertButton.vue'
import DialogForm, { defineFormFields } from '#client/components/DialogForm.vue'
import * as schemas from '#ledger/shared/validators/index.ts'
import Account from '#ledger/shared/entities/account.entity.ts'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'

const page = ref(1)
const loading = ref(false)
const tableRef = ref<ComponentExposed<typeof DataTable>>()
const deletingItems = ref<number[]>([])

const columns = defineColumns<Account>([
    {
        id: 'id',
        label: 'ID',
        field: 'id',
        width: 50,
    },
    {
        id: 'name',
        label: $t('Name'),
        field: 'name',
    },
    {
        id: 'parent',
        label: $t('Parent'),
        field: row => row.parent_name || '-',
    },
    {
        id: 'type',
        label: $t('Type'),
        field: row => row.typeLabel,
    },
    { id: 'actions' }
])

const fields = defineFormFields({
    name: {
        component: 'text-field',
        label: $t('Name'),
    },
    parent_id: {
        component: 'autocomplete',
        label: $t('Parent'),
        fetch: '/api/ledger/accounts?limit=5',
        fetchOption: (o: any) => $fetch(`/api/ledger/accounts/${o}`),
        labelKey: 'name',
        valueKey: 'id',
        clearable: true,
    },
    description: {
        component: 'text-field',
        label: $t('Description'),
    },
    type: {
        component: 'select',
        label: $t('Type'),
        options: Account.TYPES,
    },
})

function load(){
    tableRef.value?.load()
}

function reset() {
    page.value = 1
    return load()
}

async function destroy(id: Account['id']) {
    deletingItems.value.push(id)

    const [error] = await $fetch.try(`/api/ledger/accounts/${id}`, { method: 'DELETE', })

    if (error) {
        toast.error($t('Failed to delete.'))
        deletingItems.value = []
        return
    }

    setTimeout(() => {
        toast.success($t('Deleted successfully.'))
        reset()
    }, 1000)
}

watch(page, load, { immediate: true })
</script>
<template>
    <AppLayout>
        <div class="flex">
            <div class="mb-4 flex-1">
                <PageTitle>{{ $t('Accounts') }}</PageTitle>
                <PageSubtitle>{{ $t('Manage your ledger accounts.') }}</PageSubtitle>
            </div>

            <div class="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    :disabled="loading"
                    @click="load"
                >
                    <Icon
                        name="RotateCcw"
                        :class="{ 'animate-spin': loading }"
                    />
                </Button>
                <DialogForm 
                    fetch="/api/ledger/accounts"
                    :title="$t('Add new account')"
                    :description="$t('Fill in the details below to add a new account')"
                    :schema="schemas.account.create"
                    :fields="fields"
                    @submit="load"
                >
                    <Button :disabled="loading">
                        {{ $t('Add new') }}
                    </Button>
                </DialogForm>
            </div>
        </div>

        <DataTable
            ref="tableRef"
            v-model:loading="loading"
            fetch="/api/ledger/accounts"
            :serialize="row => Account.from(row)"
            :columns="columns"
        >
            <template #row-actions="{ row }">
                <div class="flex items-center gap-2 justify-end">
                    <DialogForm 
                        :title="$t('Edit account')"
                        :description="$t('Update the details of the account')"
                        :fetch="`/api/ledger/accounts/${row.id}`"
                        :method="'PUT'"
                        :values="row"
                        :schema="schemas.account.update"
                        :fields="fields"
                        @submit="load"
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                        >
                            <Icon name="edit" />
                        </Button>
                    </DialogForm>

                    <AlertButton 
                        variant="ghost"
                        size="sm"
                        :loading="deletingItems.includes(row.id)"
                        @confirm="destroy(row.id)"
                    >
                        <Icon name="trash" />
                    </AlertButton>
                </div>
            </template>
        </DataTable>
    </AppLayout>
</template>
