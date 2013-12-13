% Version created by Sheneeka Ward 
% Landsat 8
% RED -- C:\Users\syward\Documents\Impervious cover\Imagine images\9-23-13\LC80210392013217LGN00_B4.TIF
% NIR -- C:\Users\syward\Documents\Impervious cover\Imagine images\9-23-13\LC80210392013217LGN00_B5.TIF
%

% Landsat 7 
% RED -- C:\Users\syward\Documents\Impervious cover\TRAINING\x_orig_files_temp\LE70120302008149EDC00_B3.TIF
% NIR -- C:\Users\syward\Documents\Impervious cover\TRAINING\x_orig_files_temp\LE70120302008149EDC00_B4.TIF

%{
Assuming the folder name is the same as the base name for the different
bands

Input: folder path
Output: .TIFF (GeoTIFF)
%}


% Spectral Enchancement
function SpecEnchance(landsatDataFolderPath)
% Assuming that downloading image data from Glovis
% Bands used based on sensor
% X = Sensor (M = MSS, T = TM, E = ETM+, O = OLI, C = Combined OLI/TIRS)
% from LandsatInventory.txt - Glovis Documentation
timeStamp = datestr(now,'yy-mm-dd_HH-MM-SS');
satelliteSensor = struct ('M', {{'B1', 'B2', 'B3', 'B4', 'B5'}}, 'T', {{'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8'}},'E', {{'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7'}}, 'O', {{}}, 'C', {{}});
if exist(landsatDataFolderPath)

  % Check what is in folder and pull out the sensor and satellite number
  contentsOfFolder = dir(fullfile(landsatDataFolderPath,'*.tif'));
  filename = landsatDataFolderPath(end-20:end);
  

  
  if ~isempty(fieldnames(contentsOfFolder))
    % if isequal(B, satelliteSensor.('M'){1})
    % Letter for sensor
    landsatSensor = getfield(contentsOfFolder, 'name', {2});
    
    % Number for sensor
    landsatSatelliteNum = getfield(contentsOfFolder, 'name', {3});
    % LandsatSatelliteNum = getfield(contentsOfFolder, 'name', {3});
    
    for bandsNeeded=1:5
      %fprintf('Sensor: %s \n',satelliteSensor.(landSatSensor){bandsNeeded});
      if ~exist([landsatDataFolderPath '\' filename '_' satelliteSensor.(landsatSensor){bandsNeeded} '.TIF'])
          fprintf('%s\\%s \nMissing band: ', landsatDataFolderPath, filename);
          error([filename '_' satelliteSensor.(landsatSensor){bandsNeeded} '.TIF' ': All necessary bands are not in folder.']);
          break;
      end
          
    end % Seeing if files exist for loop
    
    % Spectral enhancement:
    % (NDVI, PCA, Tasseled Cap)

    % Create "band stack" of TIFs
    % Bands 1-5 & 7
	stack_tiff = cat(3, imread([landsatDataFolderPath '\' filename '_B1.TIF']), imread([landsatDataFolderPath '\' filename '_B2.TIF']), imread([landsatDataFolderPath '\' filename '_B3.TIF']), imread([landsatDataFolderPath '\' filename '_B4.TIF']), imread([landsatDataFolderPath '\' filename '_B5.TIF']), imread([landsatDataFolderPath '\' filename '_B7.TIF']));
    
    % NDVI
    
    %function NDVI=ndvi(NIR,VIR)
    % NIR = Near Infrared 
    % VIR = Visible Infrared
    
    %%%%%%
    %% Need to edit to having T and E coming from the filename,
    %% not just me hard coding it
    %%%%%%
    satelliteSensorNeeded = fieldnames(satelliteSensor);
    if isequal(satelliteSensorNeeded{2}, landsatSensor)
      [NIR_img,NIR_R]=geotiffread([landsatDataFolderPath '\' filename '_B4.TIF']);
      [VIR_img,VIR_R]=geotiffread([landsatDataFolderPath '\' filename '_B3.TIF']);
    elseif isequal(satelliteSensorNeeded{3}, landsatSensor)
      [NIR_img,NIR_R]=geotiffread([landsatDataFolderPath '\' filename '_B4.TIF']);
      [VIR_img,VIR_R]=geotiffread([landsatDataFolderPath '\' filename '_B3.TIF']);
    end
    
    
    %temp = (NIR_img-VIR_img)./(NIR_img+VIR_img);
	%temp = 255*double(NIR_img-VIR_img)./double(NIR_img+VIR_img);
	temp = single(NIR_img-VIR_img)./ single(NIR_img+VIR_img);
	
	
	% Stretch to unsigned 8-bit
	% temp = 255 .* temp;
    temp = 255 * temp;
	% dataType = class(temp);

    % convert to unsigned 8-bit
    NDVI = uint8(temp);
    




    % NDVI output TIF
    % filename_date&24HRtime_ndvi
    geotiffwrite([landsatDataFolderPath '\' filename '_' timeStamp '_ndvi.TIF'], NDVI, VIR_R, 'CoordRefSysCode', 32616);
    %geotiffwrite('C:\Users\syward\Documents\Impervious cover\Imagine images\9-23-13\results\LC80210392013217LGN00_2-23_ndvi.tif', q, VIR_R, 'CoordRefSysCode', 32616);

     %ndvi_tiffOUTPUT = NDVI;

    
    % PCA
	
	% In order to use MATLAB's PCA the matrix must be 2D. "band stack" is reshaped to (MAT_Height*MAT_Width)x(NumBands)
    Height = size(stack_tiff, 1);
	Width = size(stack_tiff, 2);
    
	reorderedStack = cat(2, reshape(stack_tiff(:,:,1), 1, Height*Width)',reshape(stack_tiff(:,:,2), 1, Height*Width)',reshape(stack_tiff(:,:,3), 1, Height*Width)',reshape(stack_tiff(:,:,4), 1, Height*Width)',reshape(stack_tiff(:,:,5), 1, Height*Width)',reshape(stack_tiff(:,:,6), 1, Height*Width)');
	Eigenmatrix = pca(single(reorderedStack), 'Algorithm', 'eig');
    
    % The negative values in some columns need to be flipped to mimic the
    % order found in ERDAS IMAGINE

    Eigenmatrix = [Eigenmatrix(:, 1), Eigenmatrix(:, 2)*-1, Eigenmatrix(:, 3)*-1, Eigenmatrix(:, 4)*-1, Eigenmatrix(:, 5)*-1, Eigenmatrix(:, 6)];
    
    % The transpose of the Eigenmatrix is used for linear combination
    EigenmatrixT = Eigenmatrix';

    % Linear combination for 1st and 2nd Principal Components
    
    
    PCOne =  single(stack_tiff(:,:,1)) *  EigenmatrixT(1, 1) + single(stack_tiff(:,:,2)) *  EigenmatrixT(1, 2) + ...
             single(stack_tiff(:,:,3)) *  EigenmatrixT(1, 3) + single(stack_tiff(:,:,4)) *  EigenmatrixT(1, 4) + single(stack_tiff(:,:,5)) *  EigenmatrixT(1, 5) + ...
             single(stack_tiff(:,:,6)) *  EigenmatrixT(1, 6);


    PCTwo = single(stack_tiff(:,:,1)) *  EigenmatrixT(2, 1) + single(stack_tiff(:,:,2)) *  EigenmatrixT(2, 2) + ...
            single(stack_tiff(:,:,3)) *  EigenmatrixT(2, 3) + single(stack_tiff(:,:,4)) *  EigenmatrixT(2, 4) + single(stack_tiff(:,:,5)) *  EigenmatrixT(2, 5) + ...
            single(stack_tiff(:,:,6)) *  EigenmatrixT(2, 6);


    geotiffwrite([landsatDataFolderPath '\' filename '_' timeStamp '_PC1.TIF'], uint8(PCOne), VIR_R, 'CoordRefSysCode', 32616);
	geotiffwrite([landsatDataFolderPath '\' filename '_' timeStamp '_PC2.TIF'], uint8(PCTwo), VIR_R, 'CoordRefSysCode', 32616);
    
    % Tasseled Cap

    
    %{
    stack_tiff = stack_tiff(3188:3198, 784:794, :);
    %}    

    if isequal(satelliteSensorNeeded{2}, 'T')
	  if isequal(str2num(landsatSatelliteNum), 4)
        %Coefficient Matrices
        %
        % Landsat 4 - TM
        %% Does not have a 7th column (No values in 7th column).
        TC_TMfour = single([0.3037, 0.2793, 0.4743, 0.5585, 0.5082, 0.1863; -0.2848, -0.2435, -0.5436, 0.7243, 0.084, -0.18; 0.1509, 0.1973, 0.3279, 0.3406, -0.7112, -0.4572; 0.8832, -0.0819, -0.458, -0.0032, -0.0563, 0.013; 0.0573, -0.026, 0.0335, -0.1943, 0.4766, -0.8545; 0.1238, -0.9038, 0.4041, 0.0573, -0.0261, 0.024]);
      
      
        % Linear combination of bands 1-5 & 7 with coefficients matrix
        
        TC_rowOne =  single(stack_tiff(:,:,1)) *  TC_TMfour(1, 1) + single(stack_tiff(:,:,2)) *  TC_TMfour(1, 2) + ...
        single(stack_tiff(:,:,3)) *  TC_TMfour(1, 3) + single(stack_tiff(:,:,4)) *  TC_TMfour(1, 4) + single(stack_tiff(:,:,5)) *  TC_TMfour(1, 5) + ...
        single(stack_tiff(:,:,6)) *  TC_TMfour(1, 6);


        TC_rowTwo = single(stack_tiff(:,:,1)) *  TC_TMfour(2, 1) + single(stack_tiff(:,:,2)) *  TC_TMfour(2, 2) + ...
        single(stack_tiff(:,:,3)) *  TC_TMfour(2, 3) + single(stack_tiff(:,:,4)) *  TC_TMfour(2, 4) + single(stack_tiff(:,:,5)) *  TC_TMfour(2, 5) + ...
        single(stack_tiff(:,:,6)) *  TC_TMfour(2, 6);


        TC_rowThree = single(stack_tiff(:,:,1)) *  TC_TMfour(3, 1) + single(stack_tiff(:,:,2)) *  TC_TMfour(3, 2) + ...
        single(stack_tiff(:,:,3)) *  TC_TMfour(3, 3) + single(stack_tiff(:,:,4)) *  TC_TMfour(3, 4) + single(stack_tiff(:,:,5)) *  TC_TMfour(3, 5) + ...
        single(stack_tiff(:,:,6)) *  TC_TMfour(3, 6);


        TC_rowFour = single(stack_tiff(:,:,1)) *  TC_TMfour(4, 1) + single(stack_tiff(:,:,2)) *  TC_TMfour(4, 2) + ...
        single(stack_tiff(:,:,3)) *  TC_TMfour(4, 3) + single(stack_tiff(:,:,4)) *  TC_TMfour(4, 4) + single(stack_tiff(:,:,5)) *  TC_TMfour(4, 5) + ...
        single(stack_tiff(:,:,6)) *  TC_TMfour(4, 6);



        TC_rowFive = single(stack_tiff(:,:,1)) *  TC_TMfour(5, 1) + single(stack_tiff(:,:,2)) *  TC_TMfour(5, 2) + ...
        single(stack_tiff(:,:,3)) *  TC_TMfour(5, 3) + single(stack_tiff(:,:,4)) *  TC_TMfour(5, 4) + single(stack_tiff(:,:,5)) *  TC_TMfour(5, 5) + ...
        single(stack_tiff(:,:,6)) *  TC_TMfour(5, 6);



        TC_rowSix = single(stack_tiff(:,:,1)) *  TC_TMfour(6, 1) + single(stack_tiff(:,:,2)) *  TC_TMfour(6, 2) + ...
        single(stack_tiff(:,:,3)) *  TC_TMfour(6, 3) + single(stack_tiff(:,:,4)) *  TC_TMfour(6, 4) + single(stack_tiff(:,:,5)) *  TC_TMfour(6, 5) + ...
        single(stack_tiff(:,:,6)) *  TC_TMfour(6, 6);  
      
      
      elseif isequal(str2num(landsatSatelliteNum), 5)
        %Coefficient Matrices
        %
        %Landsat 5 - TM
        %% 7th column has "Additive" values
	    TC_TMfive = single([0.2909, 0.2493, 0.4806, 0.5568, 0.4438, 0.1706, 10.3695; -0.2728, -0.2174, -0.5508, 0.7221, 0.0733, -0.1648, -0.731; 0.1446, 0.1761, 0.3322, 0.3396, -0.621, -0.4186, -3.3828; 0.8461, -0.0731, -0.464, -0.0032, -0.0492, 0.0119, 0.7879; 0.0549, -0.0232, 0.0339, -0.1937, 0.4162, -0.7823, -2.475; 0.1186, -0.8069, 0.4094, 0.0571, -0.0228, -0.022, -0.0336]);         
      
        % Linear combination of bands 1-5 & 7 with coefficients matrix
      
        TC_rowOne =  single(stack_tiff(:,:,1)) *  TC_TMfive(1, 1) + single(stack_tiff(:,:,2)) *  TC_TMfive(1, 2) + ...
        single(stack_tiff(:,:,3)) *  TC_TMfive(1, 3) + single(stack_tiff(:,:,4)) *  TC_TMfive(1, 4) + single(stack_tiff(:,:,5)) *  TC_TMfive(1, 5) + ...
        single(stack_tiff(:,:,6)) *  TC_TMfive(1, 6);

        %TC_rowOne = (TC_rowOne + TC_TMfive(1, 7)) * 255;
        TC_rowOne = (TC_rowOne + TC_TMfive(1, 7));

        TC_rowTwo = single(stack_tiff(:,:,1)) *  TC_TMfive(2, 1) + single(stack_tiff(:,:,2)) *  TC_TMfive(2, 2) + ...
        single(stack_tiff(:,:,3)) *  TC_TMfive(2, 3) + single(stack_tiff(:,:,4)) *  TC_TMfive(2, 4) + single(stack_tiff(:,:,5)) *  TC_TMfive(2, 5) + ...
        single(stack_tiff(:,:,6)) *  TC_TMfive(2, 6);

        %TC_rowTwo = (TC_rowTwo + TC_TMfive(2, 7)) * 255;
        TC_rowTwo = (TC_rowTwo + TC_TMfive(2, 7));

        TC_rowThree = single(stack_tiff(:,:,1)) *  TC_TMfive(3, 1) + single(stack_tiff(:,:,2)) *  TC_TMfive(3, 2) + ...
        single(stack_tiff(:,:,3)) *  TC_TMfive(3, 3) + single(stack_tiff(:,:,4)) *  TC_TMfive(3, 4) + single(stack_tiff(:,:,5)) *  TC_TMfive(3, 5) + ...
        single(stack_tiff(:,:,6)) *  TC_TMfive(3, 6);

        % TC_rowThree = (TC_rowThree + TC_TMfive(3, 7)) * 255;
        TC_rowThree = (TC_rowThree + TC_TMfive(3, 7));

        TC_rowFour = single(stack_tiff(:,:,1)) *  TC_TMfive(4, 1) + single(stack_tiff(:,:,2)) *  TC_TMfive(4, 2) + ...
        single(stack_tiff(:,:,3)) *  TC_TMfive(4, 3) + single(stack_tiff(:,:,4)) *  TC_TMfive(4, 4) + single(stack_tiff(:,:,5)) *  TC_TMfive(4, 5) + ...
        single(stack_tiff(:,:,6)) *  TC_TMfive(4, 6);

        %TC_rowFour = (TC_rowFour + TC_TMfive(4, 7)) * 255;
        TC_rowFour = (TC_rowFour + TC_TMfive(4, 7));

        TC_rowFive = single(stack_tiff(:,:,1)) *  TC_TMfive(5, 1) + single(stack_tiff(:,:,2)) *  TC_TMfive(5, 2) + ...
        single(stack_tiff(:,:,3)) *  TC_TMfive(5, 3) + single(stack_tiff(:,:,4)) *  TC_TMfive(5, 4) + single(stack_tiff(:,:,5)) *  TC_TMfive(5, 5) + ...
        single(stack_tiff(:,:,6)) *  TC_TMfive(5, 6);

        %TC_rowFive = (TC_rowFive + TC_TMfive(5, 7)) * 255;
        TC_rowFive = (TC_rowFive + TC_TMfive(5, 7));

        TC_rowSix = single(stack_tiff(:,:,1)) *  TC_TMfive(6, 1) + single(stack_tiff(:,:,2)) *  TC_TMfive(6, 2) + ...
        single(stack_tiff(:,:,3)) *  TC_TMfive(6, 3) + single(stack_tiff(:,:,4)) *  TC_TMfive(6, 4) + single(stack_tiff(:,:,5)) *  TC_TMfive(6, 5) + ...
        single(stack_tiff(:,:,6)) *  TC_TMfive(6, 6);

        % TC_rowSix = (TC_rowSix + TC_TMfive(6, 7)) * 255;
        TC_rowSix = (TC_rowSix + TC_TMfive(6, 7));        
        
      end
    end   
	
	% Tasseled Cap output TIF
    % filename_date&24HRtime_tc_bandNum
	geotiffwrite([landsatDataFolderPath '\' filename '_' timeStamp '_tc_1.TIF'], uint8(TC_rowOne), VIR_R, 'CoordRefSysCode', 32616);
	geotiffwrite([landsatDataFolderPath '\' filename '_' timeStamp '_tc_2.TIF'], uint8(TC_rowTwo), VIR_R, 'CoordRefSysCode', 32616);
	geotiffwrite([landsatDataFolderPath '\' filename '_' timeStamp '_tc_3.TIF'], uint8(TC_rowThree), VIR_R, 'CoordRefSysCode', 32616);
	geotiffwrite([landsatDataFolderPath '\' filename '_' timeStamp '_tc_4.TIF'], uint8(TC_rowFour), VIR_R, 'CoordRefSysCode', 32616);
	geotiffwrite([landsatDataFolderPath '\' filename '_' timeStamp '_tc_5.TIF'], uint8(TC_rowFive), VIR_R, 'CoordRefSysCode', 32616);
	geotiffwrite([landsatDataFolderPath '\' filename '_' timeStamp '_tc_7.TIF'], uint8(TC_rowSix), VIR_R, 'CoordRefSysCode', 32616);
    
	
	
  else
    error([landsatDataFolderPath '\n: No .tif files in folder']);
  end
  
else
    error([landsatDataFolderPath '\n: Folder does not exist']);
end 


end % Spectral Enhancement

