## MinerU PDF解析器 接口文档

### 基本信息

| 项目 | 值 |
|------|-----|
| **服务名称** | 本地MinerU-PDF解析器 |
| **Base URL** | `http://192.168.0.183:7089/api` |
| **版本** | 0.1.0 |

---

### 接口详情

#### 解析单个PDF文件

**请求**

| 项目 | 值 |
|------|-----|
| **方法** | `POST` |
| **路径** | `/tools/MinerUOCR` |
| **Content-Type** | `multipart/form-data` |

**请求参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `file` | binary | ✅ | PDF文件（二进制格式） |
| `backend` | string | ✅ | 解析后端，可选值：`vlm-http-client` |
| `rtype` | string | ✅ | 返回数据格式，可选值：`MarkDown` |

**响应**

**成功响应 (200)**

```json
{
    "success": true,
    "message": "文件解析成功",
    "filename": "example_abc123.pdf",
    "filepath": "./static/uploads/example_abc123.pdf",
    "parse_doc": "# 解析后的Markdown内容\n\n..."
}
```

**字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| `success` | boolean | 是否成功 |
| `message` | string | 结果消息 |
| `filename` | string | 服务器保存的文件名 |
| `filepath` | string | 服务器文件路径 |
| `parse_doc` | string | 解析后的Markdown内容 |

**错误响应 (422)**

```json
{
    "detail": [
        {
            "loc": ["body", "file"],
            "msg": "field required",
            "type": "value_error.missing"
        }
    ]
}
```

---

### 调用示例

**Python**

```python
import requests

url = "http://192.168.0.183:7089/api/tools/MinerUOCR"
file_path = "your_file.pdf"

with open(file_path, "rb") as f:
    files = {"file": (file_path, f, "application/pdf")}
    data = {
        "backend": "vlm-http-client",
        "rtype": "MarkDown"
    }
    response = requests.post(url, files=files, data=data, timeout=600)
    
result = response.json()
if result["success"]:
    print(result["parse_doc"])  # Markdown内容
```

**cURL**

```bash
curl -X POST "http://192.168.0.183:7089/api/tools/MinerUOCR" \
  -F "file=@your_file.pdf" \
  -F "backend=vlm-http-client" \
  -F "rtype=MarkDown"
```

**PowerShell**

```powershell
$filePath = "your_file.pdf"
$fileName = Split-Path $filePath -Leaf

$form = @{
    file = Get-Item -Path $filePath
    backend = "vlm-http-client"
    rtype = "MarkDown"
}

$response = Invoke-RestMethod -Uri "http://192.168.0.183:7089/api/tools/MinerUOCR" -Method Post -Form $form
$response.parse_doc
```

---

### 注意事项

1. **超时设置**：建议客户端设置 `timeout=600` 秒，大文件解析可能需要较长时间
2. **文件大小**：已测试支持 1.4MB 文件，处理时间约 170 秒
3. **返回格式**：目前支持 Markdown 格式输出，包含表格、标题等结构化内容