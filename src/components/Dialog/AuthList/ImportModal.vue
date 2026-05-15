<template>
  <BaseDialog :model-value="modelValue" title="批量导入许可" width="520px" :close-on-click-modal="false" confirm-text="导入"
    :confirm-disabled="!uploadedFile" @update:model-value="(val) => emit('update:modelValue', val)"
    @confirm="handleImportSubmit" @cancel="handleCancel" @close="resetModal">
    <div class="import-modal">
      <div class="import-steps">
        <p class="step-item">
          <span class="step-num">1.</span>
          下载 <el-link type="primary" underline="always" @click="handleDownloadTemplate">许可导入模版 </el-link>
        </p>
        <p class="step-item">
          <span class="step-num">2.</span>
          按要求填写数据后导入
        </p>
      </div>
      <div class="upload-area">
        <el-upload ref="uploadRef" :auto-upload="false" :limit="1" accept=".xls,.xlsx" :on-change="handleFileChange"
          :on-exceed="handleExceed" :on-remove="handleFileRemove" :file-list="fileList" :show-file-list="false" drag>
          <img :src="IconImport" />
          <div class="el-upload__text">导入</div>
        </el-upload>
      </div>
      
      <div v-if="fileList.length > 0" class="file-list-container">
        <div v-for="file in fileList" :key="file.uid" class="file-item">
          <div class="file-icon-wrapper">
            <img :src="IconExcel" />
          </div>
          <div class="file-content">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-meta">
              <span class="file-size">{{ formatSize(file.size) }}</span>
              <span class="file-status" :class="file.status">{{ getStatusText(file.status) }}</span>
            </span>
          </div>
          <button class="remove-button" @click.stop="handleRemove(file)" title="移除文件">
            <el-icon :size="16">
              <Close />
            </el-icon>
          </button>
        </div>
      </div>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { UploadFile, UploadInstance } from 'element-plus'
import { BaseDialog } from '@/components/BaseDialog'
import IconImport from '@/assets/icons/iconImport.png'
import IconExcel from '@/assets/icons/iconActive.png'

interface Props {
  modelValue: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'import', fileName: string): void
}>()

const uploadRef = ref<UploadInstance>()
const fileList = ref<UploadFile[]>([])
const uploadedFile = ref('')

const handleDownloadTemplate = () => {
  ElMessage.info('下载许可导入模版...')
}

const handleFileChange = (file: UploadFile, files: UploadFile[]) => {
  fileList.value = files
  uploadedFile.value = file.name
}

const handleExceed = (files: UploadFile[]) => {
  if (files.length > 0) {
    const newFile = files[files.length - 1]
    fileList.value = [newFile]
    uploadedFile.value = newFile.name
  }
}

const handleFileRemove = () => {
  uploadedFile.value = ''
  fileList.value = []
}

const handleRemove = (file: UploadFile) => {
  const index = fileList.value.findIndex(f => f.uid === file.uid)
  if (index > -1) {
    fileList.value.splice(index, 1)
    if (fileList.value.length === 0) {
      uploadedFile.value = ''
    }
  }
}

const formatSize = (size: number | undefined): string => {
  if (!size) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let unitIndex = 0
  let fileSize = size
  while (fileSize >= 1024 && unitIndex < units.length - 1) {
    fileSize /= 1024
    unitIndex++
  }
  return `${fileSize.toFixed(2)} ${units[unitIndex]}`
}

const getStatusText = (status?: string): string => {
  const statusMap: Record<string, string> = {
    ready: '待上传',
    success: '已上传',
    error: '上传失败',
    uploading: '上传中'
  }
  return statusMap[status || ''] || '未知'
}

const handleImportSubmit = () => {
  console.log('=== 上传文件信息 ===')
  console.log('文件名:', uploadedFile.value)
  console.log('文件列表:', fileList.value)
  if (fileList.value.length > 0) {
    const file = fileList.value[0]
    console.log('文件详情:', {
      name: file.name,
      size: file.size,
      uid: file.uid,
      status: file.status,
      url: file.url,
      raw: file.raw
    })
  }
  console.log('====================')
  ElMessage.success(`导入文件 "${uploadedFile.value}" 处理中...`)
  emit('import', uploadedFile.value)
}

const handleCancel = () => {
  uploadedFile.value = ''
  fileList.value = []
  uploadRef.value?.clearFiles()
}

const resetModal = () => {
  uploadedFile.value = ''
  fileList.value = []
  uploadRef.value?.clearFiles()
}
</script>

<style lang="scss" scoped>
.import-modal {
  .import-steps {
    margin-bottom: 20px;
    color: var(el-text-color-primary);

    .step-item {
      display: flex;
      align-items: center;
      font-size: 14px;
      margin-bottom: 8px;
      line-height: 1.6;

      .step-num {
        margin-right: 4px;
      }

      .el-link {
        margin-left: 6px;
      }
    }
  }

  .upload-area {
    margin-bottom: 16px;

    :deep(.el-upload) {
      width: 100px;
      height: 66px;
    }

    img {
      width: 24px;
    }

    .el-upload__text {
      font-size: 12px;
      color: var(--el-color-primary);
      padding-top: 4px;
    }

    :deep(.el-upload-dragger) {
      width: 100%;
      height: 100%;
      padding: 12px;

      &:hover {
        background-color: var(--input-bg-color);
      }
    }
  }

  .file-list-container {
    margin-top: 16px;

    .file-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #fafafa;
      border-radius: 8px;
      border: 1px solid #e4e7ed;
      transition: all 0.3s ease;

      &:hover {
        background: #f0f9eb;
        border-color: #b7eb8f;
      }
    }

    .file-icon-wrapper {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
      border-radius: 8px;

      img {
        width: 24px;
        height: 24px;
      }
    }

    .file-content {
      flex: 1;
      min-width: 0;

      .file-name {
        display: block;
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .file-meta {
        display: flex;
        gap: 12px;
        margin-top: 4px;
        font-size: 12px;
        color: #909399;

        .file-status {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;

          &.ready {
            background: #f0f0f0;
            color: #909399;
          }

          &.success {
            background: #f0f9eb;
            color: #67c23a;
          }

          &.error {
            background: #fef0f0;
            color: #f56c6c;
          }

          &.uploading {
            background: #e6f7ff;
            color: #1890ff;
          }
        }
      }
    }

    .remove-button {
      padding: 6px;
      border: none;
      background: transparent;
      border-radius: 4px;
      cursor: pointer;
      color: #909399;
      transition: all 0.2s ease;

      &:hover {
        background: #f56c6c;
        color: #fff;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
