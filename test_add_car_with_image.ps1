# Test adding car functionality with image upload

# Step 1: Create a test image file
$testImagePath = "D:\AI_tool\Good_Car_find\test_image.jpg"

# Create a simple test image (1x1 pixel black image)
Add-Type -AssemblyName System.Drawing
$bitmap = New-Object System.Drawing.Bitmap(1, 1)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.FillRectangle([System.Drawing.Brushes]::Black, 0, 0, 1, 1)
$bitmap.Save($testImagePath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$graphics.Dispose()
$bitmap.Dispose()

Write-Host "Test image created: $testImagePath"

# Step 2: Upload image to server
Write-Host "\nStep 2: Uploading image to server..."
try {
    # Use HttpClient to upload file (more reliable in PowerShell)
    $client = New-Object System.Net.Http.HttpClient
    $content = New-Object System.Net.Http.MultipartFormDataContent
    
    $fileStream = [System.IO.File]::OpenRead($testImagePath)
    $fileContent = New-Object System.Net.Http.StreamContent($fileStream)
    $content.Add($fileContent, "images", "test_image.jpg")
    
    $uploadResponse = $client.PostAsync("http://localhost:3000/api/cars/upload", $content).Result
    $uploadContent = $uploadResponse.Content.ReadAsStringAsync().Result
    $uploadResult = $uploadContent | ConvertFrom-Json
    
    $fileStream.Dispose()
    $fileContent.Dispose()
    $content.Dispose()
    $client.Dispose()
    
    Write-Host "Image uploaded successfully!"
    Write-Host "Returned image URLs:"
    $uploadResult.urls | ForEach-Object {
        Write-Host "- $_"
    }
    
    # Step 3: Add car using the uploaded image URLs
    Write-Host "\nStep 3: Adding car with uploaded image URLs..."
    $carData = @{
        brand = "Test Brand"
        model = "Test Model"
        year = "2020"
        mileage = 1.5
        fuelType = "Gasoline"
        transmission = "Automatic"
        displacement = 1.5
        color = "#000000"
        price = 10
        acquisitionPrice = 8
        originalPrice = 15
        description = "Test car description"
        carCondition = "Test condition"
        maintenanceRecord = "Test maintenance record"
        images = $uploadResult.urls
    } | ConvertTo-Json
    
    $addCarResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/cars" -Method POST -Headers @{"Content-Type"="application/json"} -Body $carData
    $addCarResult = $addCarResponse.Content | ConvertFrom-Json
    
    Write-Host "Car added successfully!"
    Write-Host "Returned result:"
    $addCarResult | ConvertTo-Json -Depth 3
    
    # Step 4: Verify car was added successfully (get car list)
    Write-Host "\nStep 4: Verifying car was added successfully..."
    $carsResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/cars?pageSize=5" -Method GET
    $carsResult = $carsResponse.Content | ConvertFrom-Json
    
    Write-Host "Retrieved car list:"
    $carsResult.list | ForEach-Object {
        Write-Host "- ID: $($_.id), Brand: $($_.brand), Model: $($_.model), Image count: $($_.images.Count)"
    }
    
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response content: $responseBody"
            $reader.Dispose()
        } catch {
            Write-Host "Failed to read response: $($_.Exception.Message)"
        }
    }
}

# Step 5: Clean up test file
if (Test-Path $testImagePath) {
    Remove-Item $testImagePath
    Write-Host "\nTest image cleaned up"
}
