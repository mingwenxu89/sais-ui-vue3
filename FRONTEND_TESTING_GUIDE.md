# Frontend Testing Guide - Quick Start

## Prerequisites

1. ✅ **Backend is running** and accessible at `http://localhost:48080`
2. ✅ **Database migration** has been executed
3. ✅ **Sample data** is loaded (10 crops with growth stages)
4. ✅ **Dictionaries configured** in the backend database

---

## Start the Frontend

```bash
cd /Users/mingwen/WaikatoUniversity/COMPX576/yudao-ui-admin-vue3
npm install  # If first time
npm run dev
```

Expected output:
```
VITE v4.x.x  ready in xxx ms
➜  Local:   http://localhost:80/
➜  Network: http://192.168.x.x:80/
```

Access: **http://localhost:80**

---

## Test 1: View Updated Crop Form ⭐

1. Login to the system
2. Navigate to: **Agriculture → Crop Management** (农业管理 → 作物管理)
3. Click **"Add"** button
4. **Verify**:
   - Dialog width is wider (900px)
   - **5 tabs visible**:
     - Basic Information
     - Soil & Moisture
     - Climate & Environment
     - Irrigation Parameters
     - Resources & Source

5. **Test each tab**:

### Tab 1: Basic Information
- Fill in: Name, Crop Type, Variety
- Set: Growth Period, Water Need, Status
- **Check**: All original fields still work

### Tab 2: Soil & Moisture
- Enter values for: Soil Moisture Min/Optimal/Max (0-100%)
- Enter values for: Soil pH Min/Max (0-14, decimals allowed)
- Select: Soil Type Preference
- **Check**: Number inputs have proper constraints

### Tab 3: Climate & Environment  
- Enter: Temperature Min/Optimal/Max (-50 to 60°C)
- Enter: Humidity Min/Max (0-100%)
- Enter: Light Hours Min (0-24 hours)
- **Check**: Negative temperatures work, max values enforced

### Tab 4: Irrigation Parameters
- Enter: Crop Coefficient Kc (0-2, decimal, e.g., 0.75)
- Enter: Root Depth (cm, e.g., 60)
- Select: Irrigation Method Preference
- Select: Drought Resistance (Weak/Medium/Strong)
- Select: Waterlogging Tolerance (Weak/Medium/Strong)
- **Check**: Kc accepts decimals with 2 precision

### Tab 5: Resources & Source
- Enter: Image URL (any valid URL)
- Enter: Thumbnail URL
- Enter: Cultivation Guide URL
- Enter: Data Source (e.g., "USDA Research")
- **Check**: Text inputs accept URLs

6. Click **"OK"** to submit
7. **Verify**: Crop created successfully, toast message appears

---

## Test 2: Growth Stage Management ⭐⭐

1. In the crop list, find crop "Tomato" (ID 1)
2. Click **"Stages"** button in Actions column
3. **Verify**:
   - Dialog opens with title "Growth Stages - Tomato"
   - Table shows 4 existing stages:
     - Seedling Stage (Order 1, 25 days)
     - Vegetative Growth (Order 2, 30 days)
     - Flowering & Fruiting (Order 3, 20 days)
     - Maturation (Order 4, 15 days)
   - "Add Stage" button visible at top

### Test Add Stage
4. Click **"Add Stage"** button
5. Fill in form:
   - Stage Name: "Harvest Preparation"
   - Stage Order: 5
   - Duration: 5 days
   - Kc Value: 0.60
   - Moisture Min: 50%
   - Moisture Optimal: 65%
   - Moisture Max: 75%
   - Water Requirement: 2.5 L/m²/day
   - Irrigation Frequency: Select "Every other day"
   - Description: "Reduce water before harvest"
6. Click **"OK"**
7. **Verify**: 
   - New stage appears in list
   - Stage order is 5
   - Values are correct

### Test Edit Stage
8. Click **"Edit"** on the new stage
9. Change Stage Name to "Pre-Harvest"
10. Click **"OK"**
11. **Verify**: Name updated in list

### Test Delete Stage
12. Click **"Delete"** on the test stage
13. Confirm deletion
14. **Verify**: Stage removed from list

---

## Test 3: Edit Existing Crop with New Fields

1. In crop list, click **"Edit"** on "Tomato"
2. **Verify**:
   - All tabs load correctly
   - Basic fields are populated (name, type, etc.)
   - New fields show existing values from sample data:
     - Tab 2: Soil Moisture Min=60%, Max=85%, Optimal=70%
     - Tab 4: Kc=0.75, Root Depth=60cm

3. Modify some values:
   - Change Soil Moisture Optimal to 72%
   - Change Kc Value to 0.80
   - Add Data Source: "University of California Agriculture"

4. Click **"OK"**
5. Re-open edit form
6. **Verify**: Changes persisted correctly

---

## Test 4: Dictionary Dropdowns

Check if all dropdowns are populated:

### In Crop Form
- **Tab 1**:
  - Crop Type dropdown → Should show: Vegetable, Grain, Fruit, Other
  - Water Need dropdown → Should show: Low, Medium, High
  - Status radio → Should show: Enabled, Disabled

- **Tab 2**:
  - Soil Type Preference → Should show: Sandy Loam, Clay Loam, Loam, Sandy Soil, Clay Soil

- **Tab 4**:
  - Irrigation Method → Should show: Drip, Sprinkler, Flood, Micro-sprinkler
  - Drought Resistance → Should show: Weak, Medium, Strong
  - Waterlogging Tolerance → Should show: Weak, Medium, Strong

### In Growth Stage Form
- Irrigation Frequency → Should show: Daily, Every other day, 2-3 times per week, Once per week

**If any dropdown is empty**:
→ Backend dictionaries not configured  
→ Check `BACKEND_TESTING_CHECKLIST.md` Section "Database Verification"

---

## Test 5: Validation

### Test Required Fields
1. Click "Add" crop
2. Leave "Crop Name" empty
3. Try to submit
4. **Verify**: Validation error appears

5. Leave "Crop Type" unselected
6. Try to submit
7. **Verify**: Validation error appears

### Test Number Constraints
8. In Tab 2, try entering Soil Moisture Min = 150 (>100)
9. **Verify**: Input prevents entering >100

10. Try entering Temperature Min = -100 (<-50)
11. **Verify**: Input prevents entering <-50

12. In Tab 4, try entering Kc = 3.5 (>2.0)
13. **Verify**: Input prevents entering >2.0

### Test Growth Stage Validation
14. Open growth stage form
15. Leave "Stage Name" empty
16. Try to submit
17. **Verify**: Validation error appears

---

## Test 6: Responsive Behavior

1. Resize browser window to different widths
2. **Verify**:
   - Form remains usable at different sizes
   - Columns stack properly on narrow screens
   - Dialogs don't overflow viewport
   - Tables are scrollable if needed

---

## Test 7: Search and Filter

1. In crop list, enter "Tomato" in Name field
2. Click **"Search"**
3. **Verify**: Only tomato shows in list

4. Click **"Reset"**
5. **Verify**: All crops shown again

6. Select Crop Type = "Vegetable"
7. Click **"Search"**
8. **Verify**: Only vegetables shown (Tomato, Lettuce, Potato, Cucumber, Bell Pepper)

---

## Test 8: Pagination

1. Ensure you have >10 crops (add more if needed)
2. At bottom of list, change Page Size to 5
3. **Verify**: Only 5 crops shown, pagination controls appear
4. Click page 2
5. **Verify**: Next 5 crops shown

---

## Common Issues & Quick Fixes

### Issue: Blank dropdowns
**Fix**: 
```sql
-- Check if dictionaries exist
SELECT * FROM system_dict_type WHERE type LIKE 'agri_%';
-- Should return at least 15 rows
```
If missing, run database migration again.

### Issue: Form doesn't save new fields
**Fix**:
1. Check browser console for API errors
2. Verify backend is running: `curl http://localhost:48080/agri/crop/get?id=1`
3. Check backend logs for errors

### Issue: TypeScript errors in console
**Fix**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Restart dev server

### Issue: "Stages" button does nothing
**Fix**:
1. Check browser console for errors
2. Verify import of CropGrowthStageForm in index.vue
3. Check if `stageFormRef` is defined

---

## Success Criteria Checklist

✅ **Crop Form**:
- [ ] All 5 tabs visible and switchable
- [ ] All 28 fields display correctly
- [ ] Number inputs have proper constraints
- [ ] Dictionaries populate dropdowns
- [ ] Form submits successfully
- [ ] Data persists on edit

✅ **Growth Stage Management**:
- [ ] "Stages" button opens dialog
- [ ] Existing stages display in table
- [ ] "Add Stage" opens form
- [ ] New stages can be created
- [ ] Stages can be edited
- [ ] Stages can be deleted
- [ ] Changes reflect immediately

✅ **Validation**:
- [ ] Required fields validated
- [ ] Number constraints enforced
- [ ] Error messages clear and helpful

✅ **UI/UX**:
- [ ] Forms are intuitive
- [ ] Loading states show properly
- [ ] Success/error messages appear
- [ ] Responsive on different screen sizes

---

## Performance Check

1. **Form Load Time**: Should open in <500ms
2. **API Response Time**: List load <1s, single item <200ms
3. **Smooth Tab Switching**: No lag when switching tabs
4. **Growth Stage Load**: <500ms for <20 stages

If performance is slow:
- Check network tab in browser DevTools
- Verify backend response times
- Check for console errors

---

## Next Steps After Testing

Once frontend is verified:

1. **Test with Real Data**:
   - Create crops for actual use cases
   - Configure growth stages accurately
   - Upload real images (if image upload implemented)

2. **User Acceptance Testing**:
   - Have end users test the workflow
   - Gather feedback on UI/UX
   - Identify missing features

3. **Integration with AI**:
   - Connect to irrigation decision engine
   - Test automated recommendations
   - Validate Kc calculations

4. **Production Deployment**:
   - Build production bundle: `npm run build`
   - Deploy to web server
   - Configure environment variables
   - Test in production environment

---

**Quick Start Version**: 1.0  
**Last Updated**: 2026-03-21  
**Estimated Testing Time**: 30-45 minutes
